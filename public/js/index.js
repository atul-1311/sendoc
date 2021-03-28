const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#fileInput");
const browseBtn = document.querySelector(".browseBtn");
const progressContainer = document.querySelector(".progress-container");
const bgProgress = document.querySelector(".bg-progress");
const percentDiv = document.querySelector("#percent");
const progressBar = document.querySelector(".progress-bar");
const fileURL = document.querySelector("#fileURL");
const sharingContainer = document.querySelector(".sharing-container");
const copybtn = document.querySelector("#copybtn");
const emailForm = document.querySelector("#emailForm")
const toast = document.querySelector(".toast");
const maxAllowedSize = 50 * 1024 * 1024 //50mb


const host = "https://sendoc.herokuapp.com/";
const uploadURL = `${host}api/files`;
const emailURL = `${host}api/files/send`;


dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    if(!dropZone.classList.contains("dragged")){
        dropZone.classList.add("dragged");
    }
})

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragged");
})

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragged");
    const files = e.dataTransfer.files;
    console.log(files);
    if(files.length){
        fileInput.files = files;
        uploadFile()
    }
});

fileInput.addEventListener("change", ()=>{
    uploadFile();
})

browseBtn.addEventListener("click", ()=> {
    fileInput.click();
})

copybtn.addEventListener("click", ()=>{
    fileURL.select()
    document.execCommand("copy");
    showToast("Copied to Clipboard");
})

const uploadFile = ()=> {
    if(fileInput.files.length > 1){
        fileInput.value = "";
        showToast("Upload 1 file Only !");
        return;
    }

    const file = fileInput.files[0];
    
    if (file.size > maxAllowedSize){
        showToast("Size should less than 50MB !")
        fileInput.value = "";
        return;
    }

    progressContainer.style.display = "block";

    const formData = new FormData();
    formData.append("myfile",file);

    const xhr = new XMLHttpRequest();
    //
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === XMLHttpRequest.DONE){
            console.log(xhr.response);
            showLink(JSON.parse(xhr.response))
        }
    }

    xhr.upload.onprogress = updateProgress;

    xhr.upload.onerror = ()=>{
        fileInput.value = "";
        showToast(`Error in upload: ${xhr.statusText}`)
    }

    xhr.open("POST", uploadURL);
    xhr.send(formData)
};

const updateProgress = (e)=>{
    const percent = Math.round((e.loaded / e.total) * 100);
    // console.log(percent);
    bgProgress.style.width = `${percent}%`;
    percentDiv.innerHTML = percent;
    progressBar.style.transform = `scaleX(${percent/100})`
}

const showLink = ({ file: url})=> {
    console.log(url);
    fileInput.value = "";
    emailForm[2].removeAttribute("disabled");
    progressContainer.style.display = "none";
    sharingContainer.style.display = "block";
    fileURL.value = url;
};


emailForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const url = fileURL.value;
    const formData = {
        uuid: url.split("/").splice(-1, 1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value,
        sendername: emailForm.elements["sendername"].value
    };

    emailForm[2].setAttribute("disabled", "true");
    console.table(formData);
    
    fetch(emailURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData),
    })
    .then((res) => res.json())
    .then(({ success }) => {
        if(success) {
            showToast("Email Sent");
            sharingContainer.style.display = "none";
        }
    });
});

let toastTimer;
const showToast = (msg) => {
     toast.innerText = msg;
     toast.style.display="block";
    // toast.style.display= "block";
    // toast.classList.add("toasttriggered");
    //  toast.style.transform = "translate(-50%, 0)"
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        // toast.style.transform = "translate(-50%, 60px)";
        toast.style.display = "none";
        // toast.style.transform = "translateX(60px)"
    }, 2000);
}