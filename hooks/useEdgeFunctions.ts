// export const useGetUser = () => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<Error | null>(null);

//   const fetchUser = async (userId: string) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const user = await getUser(userId);
//       return user;
//     } catch (err) {
//       setError(err as Error);
//       return null;
//     } finally {
//       setLoading(false);
//     }
//   };

//   return { fetchUser, loading, error };
// };

// export const useValidateUser = () => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<Error | null>(null);

//   const validate = async (payload: any) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const result = await validateUser(payload);
//       return result;
//     } catch (err) {
//       setError(err as Error);
//       return null;
//     } finally {
//       setLoading(false);
//     }
//   };

//   return { validate, loading, error };
// };
