import { io } from "socket.io-client";

/* const socket = io("http://localhost:5000", {
  withCredentials: true,
}); */

 const socket = io("https://3.71.165.128:5000", {
  withCredentials: true,
}); 


 
/*   const socket = io("https://bigbro-188810415119.europe-west1.run.app", {
withCredentials: true,
});  */
 
export default socket;
