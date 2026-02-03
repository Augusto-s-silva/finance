/* projeto financas pessoais */

//objeto que gerencia dados e calculos
const Transaction = {
    all: JSON.parse(localStorage.getItem('dev.finances:transactions')) || [],

    add(transaction) {
        Transaction.all.push(transaction);
        App.reload();
    },
    remove(index){
        Transaction.all.splice(index, 1);
        App.reload();
    },
    incomes(){
        //soma apenas valores > 0
        return Transaction.all.filter(t => t.amount > 0).reduce((acc, t) =>  acc + t.amount, 0);
    },
    expenses(){
        //soma apenas valores < 0
        return Transaction.all.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);
    },
    total(){
        //saldo final
        return Transaction.incomes() + Transaction.expenses();
    }
}

//objeto que gerencia a interface
const DOM = {
    transactionContainer: document.querySelector('#transaction-list'),

    addTransaction(transaction, index){
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;//armazena o indice no elemento para facilitar remoção
        DOM.transactionContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index){
        const CSSclass = transaction.amount > 0 ? "income" : "expense";
        const amount = Utils.formatCurrency(transaction.amount);

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td>
            <span class="remove-icon"
            onclick="Transaction.remove(${index})">
                &#10060;
            </span>
        </td>
        `;
        return html;
    },
    updateBalance(){
        const total = Transaction.total();
        const totalCard = document.querySelector('.card.total');

        document.getElementById('incomeDisplay').innerText = Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expenseDisplay').innerText = Utils.formatCurrency(Transaction.expenses());
        document.getElementById('totalDisplay').innerText = Utils.formatCurrency(Transaction.total());

        if(total < 0){
            totalCard.classList.add('negative');
        }else{
            totalCard.classList.remove('negative');
        }
    },
    
    clearTransactions(){
        DOM.transactionContainer.innerHTML = "";
    }
};

// objeto de utilidades formatacao
const Utils = {
    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : "";

        //regex para limpar caracteres nao numericos
        value = String(value).replace(/\D/g, "");
        value = Number(value) / 100;

        return signal + value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
        return signal + formattedValue;
    }
};

// controlador da aplicacao
const App = {
    init() {
        // renderiza cada tranzacao do array
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index);
        });

        //atualiza os cards la em cima
        DOM.updateBalance();

        //salva no navegador
        localStorage.setItem("dev.finances:transactions", JSON.stringify(Transaction.all));
    },
    reload(){
        DOM.clearTransactions();
        App.init();
    }
};

//escutador de eventos formulario
document.querySelector('#form').addEventListener('submit', (e) => {
    e.preventDefault();
    const description = document.querySelector('#description').value;

    //converte para centavos numero inteiro para evitar erros de precisão decimal do js
    let amount = document.querySelector('#amount').value * 100;

    //pegamos o estado do switch: se estiver marcado checked é saida
    const isIncome = document.querySelector('#typeCheckbox').checked;

    if(!isIncome) {
        amount = -Math.abs(amount); //transforma em negativo se for saida
    }

    if(description.trim() === "" || !amount){
        alert("Preencha os campos corretamente!");
        return;
    }

    Transaction.add({ description, amount });

    //limpeza
    e.target.reset();
});

App.init();