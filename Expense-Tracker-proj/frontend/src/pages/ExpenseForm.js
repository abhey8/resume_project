import React, { useState } from 'react'
import { handleError } from '../utils';

function ExpenseForm({ addTransaction }) {

    const [expenseInfo, setExpenseInfo] = useState({
        amount: '',
        title: ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target;
        const copyExpenseInfo = { ...expenseInfo };
        copyExpenseInfo[name] = value;
        setExpenseInfo(copyExpenseInfo);
    }

    const addExpenses = (e) => {
        e.preventDefault();
        const { amount, title } = expenseInfo;
        if (!amount || !title) {
            handleError('Please add Expense Details');
            return;
        }
        addTransaction(expenseInfo);
        setExpenseInfo({ amount: '', title: '' })
    }

    return (
        <div className='container'>
            <h1>Expense Tracker</h1>
            <form onSubmit={addExpenses}>
                <div>
                    <label htmlFor='title'>Expense Detail</label>
                    <input
                        onChange={handleChange}
                        type='text'
                        name='title'
                        placeholder='Enter your Expense Detail...'
                        value={expenseInfo.title}
                    />
                </div>
                <div>
                    <label htmlFor='amount'>Amount</label>
                    <input
                        onChange={handleChange}
                        type='number'
                        name='amount'
                        placeholder='Enter your Amount...'
                        value={expenseInfo.amount}
                    />
                </div>
                <button type='submit'>Add Expense</button>
            </form>
        </div>
    )
}

export default ExpenseForm