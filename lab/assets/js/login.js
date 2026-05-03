'use strict';
    function select(selector,all=0){
        if(all) return document.querySelectorAll(selector);
        return document.querySelector(selector);
    }
    
const sign_in_button=document.querySelector("#submit-login");
const sign_in_form=document.querySelector("#signin-form");
let password_inputs=document.querySelectorAll(`[type="password"]`);
let checkbox_caution=document.querySelector(".caution");

let checkbox=document.querySelector("#agree");
/**
 * show password
 */
password_inputs.forEach(element=>{
    element.addEventListener("focusin",()=>{
        element.type="text";
    })
});
/**
 * conceal password
 */
password_inputs.forEach(element=>{
    element.addEventListener("focusout",()=>{
        element.type="password";
    })
});
/**
 * agree to tncs
 */
checkbox.addEventListener("click",()=>{
    if(checkbox.checked){
        checkbox_caution.style.visibility="hidden";
        sign_in_button.disabled=false;
    }else{
        checkbox_caution.style.visibility="visible";
        sign_in_button.disabled=true;

    }
});

    // let year= new Date();
    // year=year.getFullYear();
    // select(".year").innerText=year;
    
function remove_info_dialog(){
    let info_dialog=document.querySelector(".info");
    if(info_dialog){
    info_dialog.classList.add("hide");}
}
setTimeout(remove_info_dialog,10000);

document.querySelectorAll("input").forEach(input =>{

    input.addEventListener("click",remove_info_dialog);
    
});