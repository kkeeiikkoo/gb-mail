import axios from "axios";

export const fetchContent = function (url: string, callback: (html: string) => void) {
  axios
    .get(url)
    .then((response) => {
      // Parse the HTML response
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(response.data, "text/html");

      // Extract the content of the div with class 'contents-box'
      const contentsBox = htmlDoc.querySelector(".contents-box");

      // Update Vue data property with the inner HTML of the found div
      if (contentsBox) {
        callback(contentsBox.innerHTML);
      }
    })
    .catch((error) => console.error("There was an error:", error));
};
