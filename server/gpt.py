import re
from datetime import datetime, timedelta

from fpdf import FPDF
from fpdf.enums import XPos, YPos
from openai import OpenAI
from pykrx.stock import get_market_ohlcv_by_date

from algorithms.tasks import module
from config.settings import GPT_API_KEY
from utils import date, utils

client = OpenAI(api_key=GPT_API_KEY)


def get_latest_stock_price(ticker, base_date):
    dt_date = datetime.strptime(base_date, "%Y%m%d")
    for i in range(10):
        try:
            target_date = (dt_date - timedelta(days=i)).strftime("%Y%m%d")
            df = get_market_ohlcv_by_date(target_date, target_date, ticker)
            if not df.empty:
                return df.iloc[0]["종가"]
        except Exception:
            continue
    return "N/A"


def get_prompt(stock_name, stock_ticker, latest_price):
    today = date.get_today()
    price_info = (
        f"참고로 이 종목의 가장 최근 종가는 '{latest_price:,.0f}원'이다."
        if isinstance(latest_price, (int, float))
        else "최신 가격 정보는 제공되지 않았다."
    )

    return (
        f"{stock_name}(티커: {stock_ticker})에 대한 상세 주식 분석 보고서를 900자 내외로 제공해 줘. 말투는 ~이다 를 사용해\n\n"
        f"**{price_info}** 이 가격 정보를 반드시 리포트에 반영해줘.\n\n"
        "분석 시에는 '네이버 증권', '연합인포맥스', 'DART 공시'의 정보를 우선적으로 참고해 줘.\n\n"
        "보고서는 다음 섹션에 따라 한국어로 구성하고 마크다운 형식으로 제공해 주고 각 섹션의 타이틀은 h2크기로 제공해. 타이틀 뒤에는 항상 계행이 들어가야돼.\n\n"
        "다음 섹션을 제외한 내용은 넣지말고 표도 사용하지마.\n\n"
        "종목에 대한 한문장 요약을 하돼, 타이틀을 넣지마\n\n"
        f"모든 분석은 현재 시점({today})까지 발표된 가장 최신 정보를 바탕으로 해야 한다. "
        f"특히 '최근 실적 및 뉴스' 섹션은 {today}을 포함한 최근 시장 동향, 공시, 뉴스 기사를 최대한 반영하여 작성해 줘.\n\n"
        "[답변]\n\n"
        "1. **기본적 분석(Fundamental Analysis)**\n\n"
        "[답변]\n\n"
        "2. **최근 실적 및 뉴스(Recent Performance & News)**\n\n"
        "[답변]\n\n"
        "3. **성장 동력 및 미래 전망(Growth Drivers & Future Outlook)**\n\n"
        "[답변]\n\n"
        "4. **리스크 요인(Risk Factors)**\n\n"
        "[답변]\n\n"
        "5. **가치 평가 요약(Valuation Summary)\n\n**"
        "[답변]\n\n"
    )


def request_ai_report(stock_name, stock_ticker, latest_price):
    try:
        response = client.responses.create(
            model="gpt-4o",
            tools=[{"type": "web_search_preview"}],
            instructions=f"""넌 지금부터 분기별로 투자포트폴리오를 구상하는 ai펀드 매니저야.\n
                우선 한국 주식시장에서 거래중인 {stock_name}을 기별 포트폴리오에 편입시키기 위한 분석을 진행해줘. 
                기준은 다음과 같아:
                    - 재무 건전성
                    - 전반적인 시장 흐름
                    - 향후 전망
                이를 위해 해당 종목의 구성 및 해당 구성종목에 영향을 미치는 지수 혹은 시장성, 구성종목들의 1년치 재무분석을 포함해서 해당 종목 투자 전망을 제시해줘.
                답변할 때는 반드시 단계별로 논리적으로 생각해줘.
                """,
            input=[
                {
                    "role": "user",
                    "content": get_prompt(stock_name, stock_ticker, latest_price),
                },
            ],
            max_output_tokens=4096,
        )
        print(response)
        content = response.output_text
        return {"content": content, "citations": []}
    except Exception as e:
        return {"content": f"GPT API 호출 중 오류 발생: {str(e)}", "citations": []}


def get_ai_portfolio_summary(portfolio_data):
    portfolio_str = ", ".join(
        [f"{item['name']}({item['weight']:.2%})" for item in portfolio_data]
    )
    prompt = (
        f"당신은 시니어 포트폴리오 매니저입니다.\n"
        f"다음과 같이 구성된 주식 포트폴리오에 대한 간결한 종합 평가를 작성해 주세요.\n\n"
        f"포트폴리오 구성: {portfolio_str}\n\n"
        f"평가는 다음 내용을 포함해야 합니다:\n"
        f"1. 포트폴리오의 전반적인 특징 (예: 특정 섹터 집중도, 안정성, 성장 가능성 등)\n"
        f"2. 긍정적인 측면과 잠재적 리스크 (단, 최대한 긍정적으로 나오지만 리스크도 짧게나마 나오게)\n"
        f"3. 전체 내용을 3~4개의 문단으로 요약하고, 말투는 '~로 보입니다.' 또는 '~입니다.'와 같이 전문적인 분석가 톤을 사용해 주세요."
    )
    try:
        response = client.responses.create(
            model="gpt-4o",
            instructions="당신은 시니어 포트폴리오 매니저입니다. 제공된 포트폴리오 구성에 대해 객관적인 시각으로 평가해주세요.",
            input=[{"role": "user", "content": prompt}],
            max_output_tokens=2048,
        )
        return response.output_text
    except Exception as e:
        print(f"포트폴리오 요약 생성 중 오류: {e}")
        return "포트폴리오 종합 평가 생성 중 오류가 발생했습니다."


def get_ai_stock_report(stock_list_with_price):
    reports = {}
    for stock_name, stock_ticker, latest_price in stock_list_with_price:
        print(f"'{stock_name}' AI 리포트 요청 중... (최신 종가: {latest_price})")
        report = request_ai_report(stock_name, stock_ticker, latest_price)
        reports[stock_name] = report
        print(f"'{stock_name}' 분석 완료")
    return reports


def save_reports_to_pdf(
    portfolio_data, reports, portfolio_summary, filename="ai_report.pdf"
):
    pdf = FPDF()
    regular_font_path = "./Nanum_Gothic/NanumGothic-Regular.ttf"
    bold_font_path = "./Nanum_Gothic/NanumGothic-Bold.ttf"
    try:
        pdf.add_font("NanumGothic", "", regular_font_path)
        pdf.add_font("NanumGothic", "B", bold_font_path)
    except RuntimeError as e:
        print(f"폰트 파일을 찾을 수 없습니다. ('{e}')")
        return
    pdf.add_page()
    pdf.set_font("NanumGothic", "B", 18)
    pdf.cell(
        0, 15, "포트폴리오 요약 및 분석", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C"
    )
    pdf.ln(10)
    pdf.set_font("NanumGothic", "B", 14)
    pdf.cell(0, 10, "포트폴리오 구성", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)
    pdf.set_font("NanumGothic", "B", 11)
    col_widths = {"name": 80, "ticker": 40, "weight": 30, "sector": 40}
    pdf.cell(col_widths["name"], 8, "종목 이름", border=1, align="C")
    pdf.cell(col_widths["ticker"], 8, "종목 코드", border=1, align="C")
    pdf.cell(col_widths["weight"], 8, "구성 비율", border=1, align="C")
    pdf.cell(
        col_widths["sector"],
        8,
        "분류",
        border=1,
        align="C",
        new_x=XPos.LMARGIN,
        new_y=YPos.NEXT,
    )
    pdf.set_font("NanumGothic", "", 10)
    for item in portfolio_data:
        pdf.cell(col_widths["name"], 8, item["name"], border=1)
        pdf.cell(col_widths["ticker"], 8, item["ticker"], border=1, align="C")
        pdf.cell(col_widths["weight"], 8, f"{item['weight']:.2%}", border=1, align="C")
        pdf.cell(
            col_widths["sector"],
            8,
            item.get("sector", ""),
            border=1,
            align="C",
            new_x=XPos.LMARGIN,
            new_y=YPos.NEXT,
        )
    pdf.ln(10)
    pdf.set_font("NanumGothic", "B", 14)
    pdf.cell(0, 10, "포트폴리오 종합 평가", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(4)
    pdf.set_font("NanumGothic", "", 11)
    pdf.multi_cell(0, 7, portfolio_summary, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    for stock_name, report_data in reports.items():
        content = report_data.get("content", "")
        citations = report_data.get("citations", [])
        if not content.strip():
            print(f"'{stock_name}'에 대한 분석 내용이 없어 PDF에 추가하지 않습니다.")
            continue
        pdf.add_page()
        citation_map = {f"[{c['index']}]": c["url"] for c in citations if c.get("url")}

        def replace_with_link(match):
            citation_key = match.group(0)
            citation_number = match.group(1)
            url = citation_map.get(citation_key)
            if url:
                return f"[[{citation_number}]({url})]"
            return citation_key

        content_with_links = re.sub(r"\[(\d+)\]", replace_with_link, content)
        pdf.set_font("NanumGothic", "B", 18)
        pdf.cell(
            0,
            15,
            f"{stock_name} 상세 주식 분석 보고서",
            new_x=XPos.LMARGIN,
            new_y=YPos.NEXT,
            align="C",
        )
        pdf.ln(10)
        paragraphs = re.split(r"\n## ", "\n" + content_with_links.strip())
        is_first_paragraph = True
        for p in paragraphs:
            if not p.strip():
                continue
            if is_first_paragraph and "**" not in p:
                pdf.set_font("NanumGothic", "", 11)
                pdf.multi_cell(
                    0, 7, p.strip(), new_x=XPos.LMARGIN, new_y=YPos.NEXT, markdown=True
                )
                pdf.ln(3)
                is_first_paragraph = False
                continue
            is_first_paragraph = False
            lines = p.strip().split("\n\n")
            title = lines[0].replace("**", "").strip()
            pdf.set_font("NanumGothic", "B", 14)
            pdf.ln(4)
            pdf.multi_cell(
                0, 8, title, new_x=XPos.LMARGIN, new_y=YPos.NEXT, markdown=True
            )
            pdf.ln(2)
            body = "\n\n".join(lines[1:])
            pdf.set_font("NanumGothic", "", 11)
            pdf.multi_cell(
                0, 7, body, new_x=XPos.LMARGIN, new_y=YPos.NEXT, markdown=True
            )
            pdf.ln(3)
        if citations:
            pdf.ln(8)
            pdf.set_font("NanumGothic", "B", 14)
            pdf.multi_cell(
                0,
                8,
                "참고 자료 (Citations)",
                new_x=XPos.LMARGIN,
                new_y=YPos.NEXT,
                markdown=False,
            )
            pdf.ln(2)
            for citation in sorted(citations, key=lambda c: c.get("index", 0)):
                index, title, url = (
                    citation.get("index"),
                    citation.get("title"),
                    citation.get("url"),
                )
                if not all([index, title]):
                    continue
                citation_text = f"[{index}] {title}"
                pdf.set_font("NanumGothic", "", 10)
                if url:
                    pdf.set_text_color(40, 89, 168)
                    pdf.multi_cell(
                        0,
                        6,
                        citation_text,
                        new_x=XPos.LMARGIN,
                        new_y=YPos.NEXT,
                        link=url,
                        markdown=False,
                    )
                    pdf.set_text_color(0, 0, 0)
                else:
                    pdf.multi_cell(
                        0,
                        6,
                        citation_text,
                        new_x=XPos.LMARGIN,
                        new_y=YPos.NEXT,
                        markdown=False,
                    )
    try:
        pdf.output(filename)
        print(f"PDF 저장 완료: {filename}")
    except Exception as e:
        print(f"PDF 저장 중 오류: {e}")


if __name__ == "__main__":
    today = date.get_today()

    # TE (TOTAL)
    # portfolio_df = get_te_portfolio(standard_date=today, risk_level=6)

    # TP퇴직연금
    # portfolio_df = module(1, 1, model="ETF", risk_level=6)

    # TTP퇴직연금
    # portfolio_df = module(1, 1, model="ETF_TQ", risk_level=6)

    # TP국내상장
    portfolio_df = module(1, 1, model="STOCK_ETF", risk_level=6)

    # TTP국내상장
    # portfolio_df = module(1, 1, model="STOCK_ETF_TQ", risk_level=6)

    # (테스트베드) TP국내상장
    # portfolio_df = module(1, 1, model="STOCK_ETF_TEST", risk_level=6, amount=300000)

    # (테스트베드) TP_ETF_P
    # portfolio_df = module(1, 1, model="ETF_TEST", risk_level=6, amount=300000)

    portfolio_df.reset_index(inplace=True)
    if "현금" in portfolio_df["isuSrtCd"].values:
        portfolio_df.drop(
            portfolio_df[portfolio_df["isuSrtCd"] == "현금"].index, inplace=True
        )
    portfolio_df["name"] = portfolio_df["isuSrtCd"].apply(utils.get_stock_name)
    portfolio_df["sector"] = portfolio_df["isuSrtCd"].apply(utils.get_sector_name)
    portfolio_df.sort_values("weight")
    print(portfolio_df)

    portfolio_data = (
        portfolio_df[["name", "isuSrtCd", "weight", "sector"]]
        .rename(columns={"isuSrtCd": "ticker"})
        .to_dict("records")
    )

    stock_list_for_reports_with_price = []
    for index, row in portfolio_df.iterrows():
        stock_name = row["name"]
        stock_ticker = row["isuSrtCd"]
        latest_price = get_latest_stock_price(stock_ticker, today)
        stock_list_for_reports_with_price.append(
            (stock_name, stock_ticker, latest_price)
        )

    final_portfolio_summary = get_ai_portfolio_summary(portfolio_data)
    final_reports = get_ai_stock_report(stock_list_for_reports_with_price)

    if final_reports:
        save_reports_to_pdf(
            portfolio_data,
            final_reports,
            final_portfolio_summary,
            filename="gpt-report.pdf",
        )
