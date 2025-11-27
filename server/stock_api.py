import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from gpt import (
    get_ai_stock_report,
    get_ai_portfolio_summary,
    get_latest_stock_price,
    save_reports_to_pdf
)
from utils import utils
from algorithms.tasks import module
from utils import date
import pandas as pd

app = Flask(__name__)
CORS(app)

@app.route('/api/stock/health', methods=['GET'])
def health_check():
    """서버 상태 확인"""
    return jsonify({
        'status': 'healthy',
        'message': 'Stock API server is running'
    })

@app.route('/api/stock/analyze', methods=['POST'])
def analyze_stock():
    """단일 주식 분석"""
    try:
        data = request.json
        stock_name = data.get('stock_name')
        stock_ticker = data.get('stock_ticker')
        
        if not stock_name or not stock_ticker:
            return jsonify({
                'error': '종목명과 종목코드를 입력해주세요.',
                'success': False
            }), 400
        
        # 최신 주가 조회
        today = date.get_today()
        latest_price = get_latest_stock_price(stock_ticker, today)
        
        # AI 리포트 생성
        print(f"'{stock_name}' 분석 시작...")
        reports = get_ai_stock_report([(stock_name, stock_ticker, latest_price)])
        
        if stock_name in reports:
            report = reports[stock_name]
            return jsonify({
                'success': True,
                'stock_name': stock_name,
                'stock_ticker': stock_ticker,
                'latest_price': latest_price,
                'report': report.get('content', ''),
                'citations': report.get('citations', [])
            })
        else:
            return jsonify({
                'error': '분석 결과를 생성할 수 없습니다.',
                'success': False
            }), 500
            
    except Exception as e:
        print(f"주식 분석 오류: {e}")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/api/stock/portfolio', methods=['POST'])
def generate_portfolio():
    """포트폴리오 생성 및 분석"""
    try:
        data = request.json
        model = data.get('model', 'STOCK_ETF')  # 기본값: 국내상장
        risk_level = data.get('risk_level', 6)  # 기본값: 6
        
        print(f"포트폴리오 생성 중... (모델: {model}, 위험도: {risk_level})")
        
        # 포트폴리오 생성
        portfolio_df = module(1, 1, model=model, risk_level=risk_level)
        portfolio_df.reset_index(inplace=True)
        
        # 현금 제거
        if '현금' in portfolio_df['isuSrtCd'].values:
            portfolio_df.drop(
                portfolio_df[portfolio_df['isuSrtCd'] == '현금'].index,
                inplace=True
            )
        
        # 종목명 및 섹터 추가
        portfolio_df['name'] = portfolio_df['isuSrtCd'].apply(utils.get_stock_name)
        portfolio_df['sector'] = portfolio_df['isuSrtCd'].apply(utils.get_sector_name)
        portfolio_df = portfolio_df.sort_values('weight', ascending=False)
        
        # 데이터 변환
        portfolio_data = portfolio_df[['name', 'isuSrtCd', 'weight', 'sector']].rename(
            columns={'isuSrtCd': 'ticker'}
        ).to_dict('records')
        
        # 포트폴리오 요약 생성
        portfolio_summary = get_ai_portfolio_summary(portfolio_data)
        
        return jsonify({
            'success': True,
            'portfolio': portfolio_data,
            'summary': portfolio_summary,
            'model': model,
            'risk_level': risk_level
        })
        
    except Exception as e:
        print(f"포트폴리오 생성 오류: {e}")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/api/stock/portfolio/report', methods=['POST'])
def generate_portfolio_report():
    """포트폴리오 전체 리포트 생성 (PDF)"""
    try:
        data = request.json
        model = data.get('model', 'STOCK_ETF')
        risk_level = data.get('risk_level', 6)
        
        print(f"전체 리포트 생성 중... (모델: {model}, 위험도: {risk_level})")
        
        # 포트폴리오 생성
        portfolio_df = module(1, 1, model=model, risk_level=risk_level)
        portfolio_df.reset_index(inplace=True)
        
        if '현금' in portfolio_df['isuSrtCd'].values:
            portfolio_df.drop(
                portfolio_df[portfolio_df['isuSrtCd'] == '현금'].index,
                inplace=True
            )
        
        portfolio_df['name'] = portfolio_df['isuSrtCd'].apply(utils.get_stock_name)
        portfolio_df['sector'] = portfolio_df['isuSrtCd'].apply(utils.get_sector_name)
        portfolio_df = portfolio_df.sort_values('weight', ascending=False)
        
        portfolio_data = portfolio_df[['name', 'isuSrtCd', 'weight', 'sector']].rename(
            columns={'isuSrtCd': 'ticker'}
        ).to_dict('records')
        
        # 모든 종목에 대한 리포트 생성
        today = date.get_today()
        stock_list_with_price = []
        for _, row in portfolio_df.iterrows():
            stock_name = row['name']
            stock_ticker = row['isuSrtCd']
            latest_price = get_latest_stock_price(stock_ticker, today)
            stock_list_with_price.append((stock_name, stock_ticker, latest_price))
        
        # AI 분석
        portfolio_summary = get_ai_portfolio_summary(portfolio_data)
        reports = get_ai_stock_report(stock_list_with_price)
        
        # PDF 저장
        pdf_filename = f"portfolio_report_{date.get_today()}.pdf"
        save_reports_to_pdf(portfolio_data, reports, portfolio_summary, filename=pdf_filename)
        
        return jsonify({
            'success': True,
            'message': 'PDF 리포트가 생성되었습니다.',
            'filename': pdf_filename,
            'portfolio': portfolio_data
        })
        
    except Exception as e:
        print(f"리포트 생성 오류: {e}")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/api/stock/search', methods=['GET'])
def search_stock():
    """종목 검색 (간단한 예시)"""
    try:
        query = request.args.get('q', '')
        
        # 실제로는 DB나 API에서 검색해야 하지만, 여기서는 예시로 몇 가지만 반환
        sample_stocks = [
            {'name': '삼성전자', 'ticker': '005930'},
            {'name': 'SK하이닉스', 'ticker': '000660'},
            {'name': 'LG전자', 'ticker': '066570'},
            {'name': '현대차', 'ticker': '005380'},
            {'name': 'NAVER', 'ticker': '035420'},
            {'name': '카카오', 'ticker': '035720'},
        ]
        
        if query:
            filtered = [s for s in sample_stocks if query.lower() in s['name'].lower()]
        else:
            filtered = sample_stocks
        
        return jsonify({
            'success': True,
            'stocks': filtered
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8001))
    print(f'\n🚀 주식 분석 API 서버가 http://localhost:{port} 에서 실행 중입니다.')
    print(f'📊 주식 분석: http://localhost:{port}/api/stock/analyze')
    print(f'📈 포트폴리오: http://localhost:{port}/api/stock/portfolio')
    print(f'❤️  Health check: http://localhost:{port}/api/stock/health\n')
    
    app.run(host='0.0.0.0', port=port, debug=True)


