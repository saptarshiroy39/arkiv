// Billing Tab Component - Current Plan, Upgrade
// 1. Displays current plan details and upgrade options


function BillingTab() {
    return (
        <div className="settings-tab">
            {/* Current Plan */}
            <div className="settings-section">
                <h2 className="settings-section-title">Your Plan</h2>
                <div className="plan-card large">
                    <div className="plan-header">
                        <span className="plan-name">Free Plan</span>
                        <span className="plan-badge free">Current</span>
                    </div>
                    <ul className="plan-features">
                        <li><i className="ti ti-check"></i> Upload up to 20 files at a time</li>
                        <li><i className="ti ti-check"></i> Chat with documents</li>
                        <li><i className="ti ti-check"></i> Use your own API keys </li>
                    </ul>
                </div>
            </div>

            {/* Upgrade - Coming Soon */}
            <div className="settings-section">
                <h2 className="settings-section-title">
                    Upgrade to Pro
                    <span className="coming-soon-badge">Coming Soon</span>
                </h2>
                <div className="plan-card pro disabled">
                    <div className="plan-header">
                        <span className="plan-name">Pro Plan</span>
                        <span className="plan-price">₹10/mo</span>
                    </div>
                    <ul className="plan-features">
                        <li><i className="ti ti-check"></i> Unlimited file uploads</li>
                        <li><i className="ti ti-check"></i> Advanced OCR processing</li>
                        <li><i className="ti ti-check"></i> Priority support</li>
                        <li><i className="ti ti-check"></i> Use your own API keys </li>
                    </ul>
                    <button className="settings-btn-primary" disabled>
                        Coming Soon
                    </button>
                </div>
            </div>
        </div>
    );
}
