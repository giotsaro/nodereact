import { io } from "socket.io-client";

/* const socket = io("http://localhost:5000", {
  withCredentials: true,
}); */

  const socket = io("https://api.caucasusgroup.com/", {
  withCredentials: true,
});  


 

 
export default socket;
