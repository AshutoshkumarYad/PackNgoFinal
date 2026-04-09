/**
 * Minimizes cash flow among a group of people.
 */

exports.minimizeCashFlow = (balances) => {
    // Convert to arrays and sort
    let debtors = [];
    let creditors = [];
    
    for (const [person, balance] of Object.entries(balances)) {
        if (balance < -0.01) debtors.push({ person, amount: -balance });
        else if (balance > 0.01) creditors.push({ person, amount: balance });
    }
    
    // Sort descending
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);
    
    let i = 0, j = 0;
    let transactions = [];
    
    while (i < debtors.length && j < creditors.length) {
        let debtor = debtors[i];
        let creditor = creditors[j];
        
        let min = Math.min(debtor.amount, creditor.amount);
        min = Math.round(min * 100) / 100; // precision
        
        transactions.push({
            from: debtor.person,
            to: creditor.person,
            amount: min
        });
        
        debtor.amount -= min;
        creditor.amount -= min;
        
        if (Math.abs(debtor.amount) < 0.01) i++;
        if (Math.abs(creditor.amount) < 0.01) j++;
    }
    
    return transactions;
}

exports.calculateSettlements = (expenses) => {
    const balances = {};
    
    expenses.forEach(exp => {
        const { paidBy, splitBetween, amount } = exp;
        if(!amount || !paidBy || !splitBetween || splitBetween.length === 0) return;
        
        if (!balances[paidBy]) balances[paidBy] = 0;
        
        // Person who paid is owed the entire amount initially
        balances[paidBy] += Number(amount);
        
        // Each person splits it
        const splitAmount = Number(amount) / splitBetween.length;
        
        splitBetween.forEach(person => {
            if (!balances[person]) balances[person] = 0;
            // They owe their portion
            balances[person] -= splitAmount;
        });
    });
    
    return {
       balances,
       settlements: exports.minimizeCashFlow(balances)
    };
}
