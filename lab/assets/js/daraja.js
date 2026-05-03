// Define key variables
const server_name = server_variables["server-name"];
const hostname = server_variables["hostname"];
const mac_address = server_variables["mac-address"];
const server_address = server_variables["server-address"];
const identity = server_variables["identity"];
const subdomain = "lab";
const loadingGif = document.querySelector(".loading-gif");
const darajaTrxStatus = document.querySelector(".daraja-status");


function confirmPurchase(event) {
    event.preventDefault(); // Prevent form submission
    // Get form values
    const packageName = document.getElementById('packageInput').value;
    const productid = document.getElementById('productIdInput').value;
    const amount = document.getElementById('amountInput').value;
    const phoneNumber = document.querySelector('input[name="phone"]').value;
    const statusElement = document.querySelector(".daraja-status");
    // Validate phone number
    if (!phoneNumber) {
        alert("Phone number is required!");
        return;
    }
    loadingGif.classList.remove("hide");
    darajaTrxStatus.classList.remove("hide");
    document.querySelector(".loading-gif").classList.add("active");
    statusElement.textContent = "Initiating STK To Your Phone...";
    darajaTrxStatus.innerText = "Sending STK to your Phone...";
    fetch("https://srv734784.hstgr.cloud:1000/stk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            PhoneNumber: phoneNumber,
            AccountReference: mac_address,
            ProductId: productid,
            Amount: amount,
        }),

    })
        .then((response) => {
            if (!response.ok) {
                darajaTrxStatus.innerText = "Failed to Initiate STK To Your Phone...";
                return response.json().then((errorData) => {
                   throw new Error(errorData.message || "Failed to initiate payment.");                
                });
            }
            return response.json();
        })
        .then((data) => {
          //  darajaTrxStatus.classList.remove("hide");        
            darajaTrxStatus.innerText = "STK send To Phone. Input PIN to continue...";
            const customerMessage = data?.message;
            const checkoutRequestID = data?.CheckoutRequestID;            
           // pollPaymentStatus(checkoutRequestID); // Call it first
            if(customerMessage){
                darajaTrxStatus.innerText = data.customerMessage
                darajaTrxStatus.innerText = customerMessage;
               // darajaTrxStatus.classList.remove("hide");
            }
            if (checkoutRequestID) {                 
                let statusInterval = setInterval(() => {
                    darajaTrxStatus.innerText = customerMessage; // Keep updating with customerMessage
                }, 500);            
            confirmTransactionStatus(checkoutRequestID, packageName, productid); // Call it first
                setTimeout(() => {
                    clearInterval(statusInterval); // Stop customerMessage updates
                    darajaTrxStatus.innerText = "Waiting for M-Pesa Transaction confirmation"; // Set this last
                }, 3000); // Delay for 3 seconds (adjust as needed)
            } else {
                throw new Error("Payment initiation failed: Missing CheckoutRequestID.");
            }
        })
        .catch((error) => {            
            resetStatusIndicators();
        });
}

function confirmTransactionStatus(checkoutRequestID, packageName,productid) {    
    let pollingInterval = setInterval(async () => {
        try {
            const response = await fetch(`https://srv734784.hstgr.cloud:1000/status/${checkoutRequestID}`)
            if (response.ok) {
               darajaTrxStatus.innerText = "Waiting for M-Pesa Transaction confirmation";       
                const resultBody = await response.json(); 
                console.log(resultBody);
            //    const resultCode = resultBody.resultCode;
               const mpesaReciept = resultBody.receipt;
               const phone = resultBody.phone; 
               const amount = resultBody.amount;
               console.log(mpesaReciept, phone, amount);               
                // Handle different transaction statuses              
                if (resultBody.status === "success") {
                    clearInterval(pollingInterval);
                    darajaTrxStatus.innerText = "Please Wait a moment...";
                    fetch("https://srv734784.hstgr.cloud:1000/register", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            PhoneNumber: phone,
                            AccountReference: packageName,
                            username: mpesaReciept,
                            mac_address,
                            server_name,
                            server_address,
                            identity,
                            hostname,
                            ProductId: productid,
                            subdomain: subdomain
                        }),
                    })
                        .then((response) => {
                            if (!response.ok) {                
                                return response.json().then((errorData) => {
                                   throw new Error(errorData.message || "Failed to create account.");                
                                });
                            }
                            return response.json();
                        })
                        .then((data) => {                        
                            darajaTrxStatus.innerText = data.message || "Account created successfully.";
                        })
                        .catch((error) => {                        
                            darajaTrxStatus.innerText = "Failed to create account. Please contact support.";
                            resetStatusIndicators();
                        });
                    //document.querySelector(".loading-gif").classList.add("hide");
                    darajaTrxStatus.innerText = "Success! Logging in...";
                    let loginAttempts = 0;
                    const maxLoginAttempts = 3;
                    function tryLogin() {
                        loginAttempts++;
                        window.open(`http://${hostname}/login?username=${mpesaReciept}&password=${mpesaReciept}`, "_self");
                        darajaTrxStatus.innerText = `Attempting login... (${loginAttempts}/${maxLoginAttempts})`;
                        // If you have a way to check if login failed (e.g., via AJAX or callback), put that logic here.
                        // Otherwise, just retry after a delay.
                        if (loginAttempts < maxLoginAttempts) {
                            setTimeout(() => {
                                darajaTrxStatus.innerText = "There Was an Error. Retrying login...";
                                tryLogin();
                            }, 5000); // Retry after 5 seconds
                        } else {
                            darajaTrxStatus.innerText = "Please Contact Customer Service for help!.";
                        }
                    }

                    setTimeout(tryLogin, 3000); // First attempt after 5 seconds
                } else if (resultBody.status === "failed") {
                 //    const message = mapResultCodeToMessage(resultCode);
                  //  displayError(message);
                    darajaTrxStatus.innerText =  `${resultBody.reason}`;
                   // darajaTrxStatus.innerText = message;
                    clearInterval(pollingInterval);
                   // resetStatusIndicators();
                    resetForm();
                    //  setTimeout(() => {
                    //     closePopup(); // Close the popup after a delay
                    // }, 3000); // Delay for 3 seconds (adjust as needed)
                   
                 }
            }
        } catch (error) {            
            displayError("Error: Could not fetch transaction status.");
            darajaTrxStatus.innerText="An Error Occured", error;
            resetStatusIndicators();
            clearInterval(pollingInterval);
            resetForm();
        }
    }, 3000); // Poll every 3 seconds
}


function displayError(message) {
    const errorContainer = document.getElementById("error-container");
    errorContainer.innerHTML = message;
}
function closeModal() {
    resetForm();
    closePopup();
    resetStatusIndicators();
}
function resetStatusIndicators() {
    //loadingGif.classList.add("hide");
    darajaTrxStatus.classList.add("hide");
    darajaTrxStatus.innerText = "";
}



function resetForm() {
    let form = document.getElementById("paymentForm");
    let modal = document.getElementById("packageModal");

    if (form) {
        form.reset(); // Reset form fields
    }

    if (modal) {
        modal.style.display = "none"; // Hide modal
    }
    //  else {
    //     console.warn("Modal not found!");
    // }
}

async function silentLogin() {
    try {
        const recover_code_query = await fetch(
            "https://srv734784.hstgr.cloud:1000/recover",
            {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({ mac: mac_address })
            }
        );
        if (!recover_code_query.ok) {
            return;
        }
        const code_recovery_response = await recover_code_query.json();
        if (!code_recovery_response) {
            return;
        }
        // Extract username from possible response shapes
        let username = code_recovery_response.username;

         if (!username || username.trim() === "") {
            console.warn("No username found — silent login aborted.");
            return;
        }
        // Hidden iframe background auth
        const iframe = document.createElement("iframe");
        iframe.src = `http://${hostname}/login?username=${(username)}&password=${(username)}`;
        iframe.style.decription = "nas roaming";
        iframe.style.display = "none";
        document.body.appendChild(iframe);
    } catch (e) {
        // ignore failures silently
    }
}

//recover onload
silentLogin();


// this consts have been declared here for relevance

const resolve_trx_button=document.querySelector("#search-api-button");
const mpesa_code_input=document.querySelector("#mpesa-code");
const resolve_container=document.querySelector("#resolve-container") || document.querySelector(".response-from-search");
function getResolveContainer(){
    return document.querySelector("#resolve-container") || document.querySelector(".response-from-search");
}
// Expose for inline handlers if present
// eslint-disable-next-line no-undef
if(typeof window !== 'undefined'){ window.resolve_container = resolve_container; }
function bindResolveHandlers(){
    const btn=document.querySelector("#search-api-button");
    const input=document.querySelector("#mpesa-code");
    if(btn){ btn.addEventListener("click", resolve_transaction); }
    if(input){
        input.addEventListener("keydown", (e)=>{
            if(e.key==="Enter"){ e.preventDefault(); resolve_transaction(); }
        });
    }
}
// bind now if elements exist, and again on DOMContentLoaded to be safe
bindResolveHandlers();
document.addEventListener("DOMContentLoaded", bindResolveHandlers);
//search-api-button
//mpesa-code
async function resolve_transaction(){
    /**
 * patner
 * apikey
 * trx-code
 * mac
 */
//const mac_address=server_variables["mac-address"];
    let mpesa_code = (mpesa_code_input?.value || "").toString().trim().toUpperCase();
    mpesa_code = mpesa_code.replace(/\s+/g, "").substring(0,10);
    var pattern = /^[A-Z0-9]{10}$/;
       if(!mpesa_code || !pattern.test(mpesa_code)){
           alert("Valid 10-character M-PESA Transaction Code is required");
           return;
       }
       const container = getResolveContainer();
       if(container){ container.innerHTML="<i>Please wait...</i>"; }
    //    const resolve_form = new FormData();
    //    resolve_form.append("trx-code",mpesa_code);
    //    resolve_form.append("mac",mac_address);
    //    const mac= mac_address;
       let resolution_query=await fetch("https://srv734784.hstgr.cloud:1000/resolve",
    {
        method : "POST",
        body : JSON.stringify({
            mac: mac_address,
            trx_code: mpesa_code
        })
    }
    )
    if(resolution_query.status==200){
        /*
      {"response_type":"error","message":"Transaction does not exist"}
      */

let response=await resolution_query.json();
console.log(response);
/**
 * this section will cover the code exits if 
 * transaction does not exist
 * wrong api credentials
 * missing request parameters
 */
let response_type=response.response_type;
if(response_type==="error"){
    const container = getResolveContainer();
    if(container){ container.innerHTML=`
<p><span>Response: </span><span>${response_type}</span></p>
<p><span>Message: </span><span>${response.message}</span></p>
    `; }
}else if(response_type==="resolved"){
           /*
        multiple resolve
        {"response_type":"resolved","mac":"C8:3A:35:51:D3:D8","used":"0","message":"Transaction was resolved on 18-Apr-2024 09:08:02"}
        */ /*
       existing valid mpesa code
       {"response_type":"resolved","length":1,"items":"username":"SDH2G9R3OI","amount":"100","TrxDate":"17-Apr-2024 12:44:55","used":"1"}
       */
    let additional_message="";
    /**
     * check if the existing trx has been used or not
     */
    let used=response.used;
    let mac=response.mac;
    if(used==="1"){
        additional_message=` and was used by ${mac}`;
    }
    if(used==="0"){
        additional_message=` but has not been used,<br> Click  <a class="link"  href="http://${hostname}/login?username=${mpesa_code}&password=${mpesa_code}" target="_self">here</a> to use this voucher`
    }
    const container = getResolveContainer();
    if(container){ container.innerHTML=`
    <p><span>Response: </span><span>${response_type}</span></p>
    <p><span>Message: </span><span>${response.message+additional_message}</span></p>
        `; }
}else if(response_type==="processing"){
    /**
     * delay f0r 10 seconds 
     */
    await  new Promise(resolve => setTimeout(resolve, 10000));
    resolve_transaction();
    return;
}
else{
/**
      * being processed
      {"response_type":"processing","time_stamp":"18-Apr-2024 10:26:21","ConversationID":"AG_20240418_201057bacba2abe2e45d"}
      */
    return;
}
 
     
    }
}

// Ensure function is available if HTML uses onclick="resolve_transaction()"
// eslint-disable-next-line no-undef
if(typeof window !== 'undefined'){ window.resolve_transaction = resolve_transaction; }
