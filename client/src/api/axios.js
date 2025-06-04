import axios from "axios";

const API = axios.create({
  baseURL: "https://nodereact-a43x.onrender.com/api", // back-end URL
  withCredentials: true, // cookie-ს გაგზავნა
});

export default API;
