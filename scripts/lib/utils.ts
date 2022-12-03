import http from "http";
import https from "https";

export async function get(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    (url.startsWith("https:") ? https : http).request(url, (res) => {
      let data = "";
  
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          resolve(data);
        } catch {
          reject();
        }
      });
    }).on("error", () => {
      reject();
    }).end();
  });
}
