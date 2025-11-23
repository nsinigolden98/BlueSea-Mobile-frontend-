async function getFullTansactionHistory() {
    const history = await getRequest(ENDPOINTS.history)
    let tbody = document.getElementById("transactions");
    tbody.innerHTML = '';
    
    for(let i = 0; i< history.length ; i++){
        let  description = history[i].description
        let  time = getDate(history[i].created_at.slice(0,10))
        let  amount =  history[i].formatted_amount
        if(history[i].transaction_type ==='DEBIT'){
             amount = "-" + amount;
        }
        else{
             amount = "+" + amount;
        }
        
        const cellOne = document.createElement('td')
        const cellTwo = document.createElement('td')
        const cellThree = document.createElement('td')
        
        cellOne.textContent = description 
        cellTwo.textContent = time
        cellThree.textContent = amount
        
        const row = document.createElement('tr')
        row.appendChild(cellOne);
        row.appendChild(cellTwo);
        row.appendChild(cellThree);
        tbody.appendChild(row);
    }
}
getFullTansactionHistory();