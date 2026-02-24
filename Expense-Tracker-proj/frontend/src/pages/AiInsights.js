import React, { useState } from 'react';
import { APIUrl } from '../utils';
import { handleError, handleSuccess } from '../utils';

const AiInsights = ({ expenses }) => {
    const [insight, setInsight] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchInsights = async () => {
        if (!expenses || expenses.length === 0) {
            handleError("No expenses to analyze yet.");
            return;
        }

        try {
            setLoading(true);
            const url = `${APIUrl}/ai-insights`;
            const headers = {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            };
            const response = await fetch(url, headers);

            if (response.status === 403) {
                handleError("Authentication failed.");
                setLoading(false);
                return;
            }

            const result = await response.json();
            if (result.success && result.data) {
                setInsight(result.data);
                handleSuccess("AI Insight generated successfully!");
            } else if (result.success) {
                setInsight(result.message);
                handleSuccess("AI Insight fetched.");
            } else {
                handleError(result.message);
            }
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '10px', boxShadow: '0px 0px 5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>🤖 AI Financial Insights</h3>
            <p style={{ color: '#555' }}>Get personalized financial advice based on your recent transactions powered by Google Gemini.</p>
            <button
                onClick={fetchInsights}
                className="ai-button"
                style={{
                    backgroundColor: '#8e44ad',
                    color: 'white',
                    padding: '10px 15px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: '0.3s'
                }}
                disabled={loading}
            >
                {loading ? "Generating Insight..." : "Ask AI for Advice"}
            </button>

            {insight && (
                <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#fff', borderRadius: '5px', borderLeft: '4px solid #8e44ad', whiteSpace: 'pre-wrap' }}>
                    <strong>Insight:</strong><br />
                    {insight}
                </div>
            )}
        </div>
    );
};

export default AiInsights;
