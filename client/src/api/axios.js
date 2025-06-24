import axios from "axios";

const API = axios.create({
  //baseURL: "http://localhost:5000/api", // back-end URL
  baseURL: "https://api.caucasusgroup.com/api", // back-end URL
 
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    //"Authorization": `Bearer ${token}`, // თუ ავტორიზაცია გჭირდება
    "Access-Control-Allow-Origin": "*"
  }
  
});

export default API;
