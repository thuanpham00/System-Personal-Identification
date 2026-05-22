export const setIsLoginToLS = (isLogin: boolean) => {
  return localStorage.setItem("isLogin", isLogin.toString());
};

export const getIsLoginFromLS = () => {
  return localStorage.getItem("isLogin") === "true";
};

export const setNameUserToLS = (name: string) => {
  return localStorage.setItem("name_user", name);
};

export const getNameUserFromLS = () => {
  return localStorage.getItem("name_user") || "";
};

export const clearLS = () => {
  localStorage.removeItem("isLogin");
  localStorage.removeItem("name_user");
};
