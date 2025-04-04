import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import Papa, { ParseError } from 'papaparse';

type Transaction = {
    runDate: string;
    account: string;
    action: string;
    symbol: string;
    description: string;
    type: string;
    quantity: number;
    currency: string;
    price: number | null;
    commission: number | null;
    fees: number | null;
    amount: number | null;
    settlementDate: string | null;
};

const parseCSV = async (filePath: string): Promise<Transaction[]> => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return reject(err);
            }
            Papa.parse(data, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const transactions = results.data.map((data: any) => ({
                        runDate: data['Run Date'],
                        account: 'Fidelity',
                        action: data['Action'],
                        symbol: data['Symbol'],
                        description: data['Description'],
                        type: data['Type'],
                        quantity: parseFloat(data['Quantity']),
                        currency: data['Currency'],
                        price: data['Price'] ? parseFloat(data['Price']) : null,
                        commission: data['Commission'] ? parseFloat(data['Commission']) : null,
                        fees: data['Fees'] ? parseFloat(data['Fees']) : null,
                        amount: data['Amount'] ? parseFloat(data['Amount']) : null,
                        settlementDate: data['Settlement Date'] || null,
                    }));
                    resolve(transactions);
                },
                error: (error: ParseError) => reject(error),
            });
        });
    });
};

type DerivedTransaction = Transaction & {
    totalCost: number | null;
    isBuy: boolean;
};

const deriveFields = (transactions: Transaction[]): DerivedTransaction[] => {
    return transactions.map((transaction) => ({
        ...transaction,
        totalCost: transaction.price && transaction.quantity ? transaction.price * transaction.quantity : null,
        isBuy: transaction?.action?.toLowerCase().includes('bought'),
    }));
};

export async function GET(request: Request) {
    console.log('Request received:', request.method, request.url);
    try {
        const filePath = path.join(process.cwd(), 'data', 'Fidelity_Accounts_History.csv');
        const transactions = await parseCSV(filePath);
        const derivedTransactions = deriveFields(transactions);
        return new NextResponse(JSON.stringify(derivedTransactions), { status: 200, headers: {
            'Content-Type': 'application/json',
        } });
    } catch (error) {
        console.error('Error processing request:', error);
        return new Response(JSON.stringify(error), { status: 500 });
    }
}
