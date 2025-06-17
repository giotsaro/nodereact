import axios from "axios";

const API = axios.create({
  //baseURL: "http://localhost:5000/api", // back-end URL
  baseURL: "https://3.71.165.128:5000/api", // back-end URL
  //baseURL: "https://bigbro-188810415119.europe-west1.run.app/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    //"Authorization": `Bearer ${token}`, // თუ ავტორიზაცია გჭირდება
    "Access-Control-Allow-Origin": "*"
  }
  
});

export default API;
