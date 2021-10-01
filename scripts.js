
/* Método para abrir e fechar modal */
const Modal = {

    toggle () {
        document
            .querySelector('.modal-overlay')
            .classList
            .toggle('active')
    }
/*     open (){
    // Abrir modal
    // Adicionar a class active ao modal
    document
        .querySelector('.modal-overlay')
        .classList
        .add('active')
    },
    close() {
        // Fechar o modal
        // Remove a class acive do modal
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active')
    } */
}

/* Estrutura para guardar dados no localstorage do navegador  */
const Storage = {
    get(){
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
    },
    set(transactions){
        localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions))
    }
}

/* Método para realizar as somas das transações */
const Transaction = {
    /* Objeto contendo array com objetos contendo as transações */
    all: Storage.get(),

    add (transaction) {
        Transaction.all.push(transaction)
        App.reload()
    },

    remove(index){
        Transaction.all.splice(index, 1)
        App.reload()
    },

    incomes(){
        let income = 0
        // pegar todas as transações
        // para cada transação,
        Transaction.all.forEach(transaction =>{
            // se ela for maior que zero
            if (transaction.amount > 0) {
                // somar a uma variavel e retornar a variavel
                income += transaction.amount;
            }
        })
        return income
    },

    expense(){
        let expense = 0
        Transaction.all.forEach(transaction =>{
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense
    },

    total(){

        return Transaction.incomes() + Transaction.expense()
    },
}

/* Método para substituir informações para o HTML  */
const DOM = {
    /* Variável contendo elemento tbody do HTML*/
    transactionsContainer: document.querySelector('#data-table tbody'),


    /* Função para adicionar uma transação no HTML */
    addTransaction(transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction (transaction, index)
        tr.dataset.index = index
        DOM.transactionsContainer.appendChild(tr)
    },  

    /* Função para acrescentar valores na tabela HTML */
    innerHTMLTransaction (transaction, index){
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html =`
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})"src="./assets/minus.svg" alt="Remover transação">
        </td>
        `
        return html
    },

    /* Função que atualiza os valores dos cards */
    updateBalance(){
        document
            .getElementById("incomeDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById("expenseDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.expense())
        document
            .getElementById("totalDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    /* Função para limpar os dados antes de atualizar */
    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    }
}

/* Estrutura para formatar os dados */
const Utils = {
    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString('pt-br',{
            style: 'currency', 
            currency: 'BRL'
        });

        return signal + value
    },

    formatAmount(value){
       value = Number(value) * 100
        return value
    },

    formatDate(date){
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]} /${splittedDate[0]}`
    }
}

/* Estrutura para inicialização e atualização dos dados  */
const App = {
    init(){
        /* Estrutura de repetição para preencher todas as transações automaticamente */ 
        Transaction.all.forEach((transaction, index) =>{
            DOM.addTransaction(transaction, index)
        })

        DOM.updateBalance()
        Storage.set(Transaction.all)
    },
    
    reload(){
        DOM.clearTransactions()
        App.init()
    },
}

/* Estrura de entrada de dados após o preenchimento do formulário */
const Form = {

    /* incorporando os elementos HTML*/
    description: document.getElementById('description'),
    amount: document.getElementById('amount'),
    date: document.getElementById('date'),


    /* Função para retornar o valor de cada INPUT*/
    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },

    /* Estrutura para validar se todos dados foram preenchidos*/
    validateFields() {
        const {description, amount, date} = Form.getValues()
        if (description.trim() === "" || amount.trim() === "" || date.trim() === ""){
            throw new Error ("Por favor, preencha todos os campos")
        }
    },

    /* Função para formatar os valores inseridos */
    formatValues(){
        let {description, amount, date} = Form.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return{
            description,
            amount,
            date
        }
    },

    /* Função para limpar os campos do formulário*/
    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    /* Função onsubmit HTML, para salvar os dados inseridos no formulário */
    submit(event) {
        event.preventDefault()
        try{
            // verificar se os campos estão validos
            Form.validateFields()
            // formatar os dados para salvar
            const transaction = Form.formatValues()
            // salvar
            Transaction.add(transaction)
            // apagar os dados do formulário
            Form.clearFields()
            // modal feche
            Modal.toggle()
        } catch(error){
            alert(error.message)
        }
    },
}

/* Função para iniciar a chamada */ 
App.init()
