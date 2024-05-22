$(window).on("load", function () {
  console.log("Hi, I am Etix.js on Window load :)");
  if (window.location.pathname === "/ticket/mvc/legacyOnlineSale/performance/sale/deliverOrder") {
    get_confirmation_data_etix();
  }
});

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  if (request.cmd === "save_confirmation_capture_etix") {
    save_confirmation_capture_etix(request.image);
  }
});

// fetch ticketmaster_confirmation_page
async function get_confirmation_data_etix() {
  try {
    const response = await fetch("https://www.etix.com/ticket/mvc/legacyOnlineSale/performance/sale/deliverOrder", {
      credentials: "include",
      method: "GET",
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Content-Type": "text/plain;charset=UTF-8",
        "accept-language": "en-US,en;q=0.9",
        "sec-ch-ua": '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
    });
    // add  email
    let result = await chrome.storage.local.get(["email"]);

    // build confirmation res
    var confirmation_res_etix = {
      id: Math.random().toString().substring(2, 7) + Math.random().toString().substring(2, 7) + Math.random().toString().substring(2, 7) + Math.random().toString().substring(2, 7),
      created: new Date(),
      type: "purchase_confirmation_etix",
      data: {},
      email: result["email"],
    };

    if (response.status === 200) {
      // logic for successful response

      const res = await response.text();
      console.log("Purchase Tracker get_confirmation_data_etix Response : Success", res);
      confirmation_res_etix.data = res;
      // send message to dashboard
      chrome.runtime.sendMessage({ cmd: "add_indexeddb_record_etix", confirmation_res_etix: confirmation_res_etix });
      // automaically take confirmation page screenshot
      chrome.runtime.sendMessage({ cmd: "confirmation_capture_etix" });
      // post confirmation data to db
      post_confirmation_data_etix(confirmation_res_etix);
    }
  } catch (err) {
    console.warn({ where: "Error in  get_confirmation_data_etix", e: err });
  } finally {
  }
}
async function post_confirmation_data_etix(confirmation_res_etix) {
  try {
    //const url = "https://browser-data-capture-api-staging.ticketboat-admin.com/store_browser_data";
    const url = "https://browser-data-capture-api.ticketboat-admin.com/store_browser_data";
    const response = await fetch(url, {
      //credentials: "include",
      method: "POST",
      headers: {
        /* Authorization: "Bearer c703542300f64fc1ad0b28272e3d9a35", */
        Authorization: "Bearer 49b996be420e48a0ae4beae399438c78",
        Accept: "/",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Content-Type": "application/json",
        "accept-language": "en-US,en;q=0.9",
        "sec-ch-ua": '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },

      body: JSON.stringify(confirmation_res_etix),
    });

    if (response.status === 200) {
      // logic for successful response

      const res = await response.json();
      console.log("Purchase Tracker post_confirmation_data_etix Response : Success");
      console.log(res);
    } else {
    }
  } catch (err) {
    console.warn({ where: "Error in post_confirmation_data_etix", e: err });
  }
}

function save_confirmation_capture_etix(image) {
  let a = document.createElement("a");
  a.download = "capture_confirmation_etix.png";
  a.href = image;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
