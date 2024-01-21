let availableKeywords=[
    "Arthritis",
    "Back Pain",
    "Stomach Infection",
    "Headache",
    "Throat Infection",
    "Cough and cold",
    "Fever",
    "Burn Injury/Accidents",
    "Sports Injury",
    "Chest Pain",
    "Anxiety"
];

const resultsbox=document.querySelector(".result-box");

const inputBox=document.getElementById("input-box");

inputBox.onkeyup=function(){
    let result=[];
    let input=inputBox.value;
    if(input.length){
        result=availableKeywords.filter((keyword)=>{
            return keyword.toLowerCase().includes(input.toLowerCase());
        })
    }
    display(result);

    if(!result.length){
        resultsbox.innerHTML="";
    }
}

function display(result){
    const content=result.map((list)=>{
        return "<li onclick=selectInput(this)>"+list+"</li>";
    })

    resultsbox.innerHTML="<ul>"+ content.join('') + "</ul>"
}

function selectInput(list){
    inputBox.value=list.innerHTML;
    resultsbox.innerHTML="";
}

