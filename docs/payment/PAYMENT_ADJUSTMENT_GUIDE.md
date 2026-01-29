# 💳 Payment Adjustment & Plan Change Guide

This document explains how payment adjustments work when users change their subscription plans.

---

## 🔒 Plan Upgrade Restrictions

### Free → Pro Restriction
- **Free users CANNOT directly upgrade to Pro**
- They must first upgrade to **Starter**, then upgrade to **Pro**
- This restriction is enforced in the UI (button is disabled) and backend

### Allowed Upgrade Paths
- ✅ Free → Starter (any billing period)
- ✅ Starter → Pro (any billing period)
- ✅ Monthly → Annual (same plan, prorated)
- ✅ Annual → Monthly (same plan, prorated)
- ✅ Pro → Starter (downgrade, with prorating)

---

## 💰 Payment Adjustment Logic

### How Prorating Works

When a user with an **active subscription** changes their plan or billing period, the system calculates prorated amounts:

1. **Calculate Remaining Time**
   - Gets the remaining time in the current billing period
   - Calculates the ratio: `remaining_time / total_billing_period`

2. **Calculate Unused Credit**
   - Unused credit = `current_plan_price × remaining_ratio`
   - This is the amount already paid but not yet used

3. **Calculate New Payment**
   - New payment = `new_plan_price × remaining_ratio - unused_credit`
   - If positive: User pays the difference
   - If negative: User receives a credit

---

## 📊 Payment Scenarios

### Scenario 1: Upgrade (Starter → Pro)

**Example:**
- User is on **Starter Monthly** ($20/month)
- 15 days remaining in current month (50% of month left)
- Upgrading to **Pro Monthly** ($40/month)

**Calculation:**
- Unused credit: $20 × 0.5 = **$10**
- New plan cost: $40 × 0.5 = **$20**
- Amount to pay: $20 - $10 = **$10**

**Result:** User pays $10 (prorated difference) for the upgrade.

---

### Scenario 2: Downgrade (Pro → Starter)

**Example:**
- User is on **Pro Monthly** ($40/month)
- 15 days remaining (50% of month left)
- Downgrading to **Starter Monthly** ($20/month)

**Calculation:**
- Unused credit: $40 × 0.5 = **$20**
- New plan cost: $20 × 0.5 = **$10**
- Amount to pay: $10 - $20 = **-$10** (credit)

**Result:** User receives a $10 credit applied to their account.

---

### Scenario 3: Billing Period Change (Monthly → Annual)

**Example:**
- User is on **Starter Monthly** ($20/month)
- 15 days remaining (50% of month left)
- Switching to **Starter Annual** ($168/year = $14/month)

**Calculation:**
- Unused credit: $20 × 0.5 = **$10**
- New plan cost: $168 × (0.5/12) = **$7** (prorated for remaining 15 days)
- Amount to pay: $7 - $10 = **-$3** (credit)

**Result:** User receives a $3 credit, and subscription switches to annual billing.

---

### Scenario 4: New Subscription (Free → Starter)

**Example:**
- User is on **Free** plan (no active subscription)
- Upgrading to **Starter Monthly** ($20/month)

**Calculation:**
- No unused credit (no active subscription)
- Full price: **$20**

**Result:** User pays full $20 for the new subscription.

---

## 🔄 Implementation Details

### Frontend (App.tsx)

1. **Validation:**
   - Prevents Free → Pro direct upgrade
   - Shows confirmation dialog for downgrades
   - Displays payment adjustment messages

2. **Data Sent to Backend:**
   ```typescript
   {
     userId: string,
     planId: string,
     billingPeriod: string,
     currentPlan: string,
     currentBillingPeriod: string,
     subscriptionId: string | null,
     hasActiveSubscription: boolean
   }
   ```

### Backend (create-checkout Edge Function)

1. **Prorating Calculation:**
   - Calculates remaining time ratio
   - Computes unused credit from current subscription
   - Calculates prorated amount for new plan
   - Includes adjustment info in checkout metadata

2. **Checkout Payload:**
   - Includes subscription_id if user has active subscription
   - Adds prorated_amount and adjustment_note in metadata
   - DodoPayments handles the actual payment processing

---

## ⚠️ Important Notes

### DodoPayments API Considerations

1. **Subscription Updates:**
   - DodoPayments may handle prorating automatically
   - Check DodoPayments API docs for subscription update methods
   - May need to use subscription update endpoint instead of new checkout

2. **Payment Processing:**
   - Prorated amounts are calculated and passed in metadata
   - DodoPayments will process the actual payment
   - Credits may be applied as account credits or refunds

3. **Testing:**
   - Test all scenarios in test mode first
   - Verify prorating calculations are correct
   - Check that DodoPayments processes adjustments correctly

---

## 🧪 Testing Checklist

- [ ] Free user cannot select Pro plan (button disabled)
- [ ] Free → Starter upgrade works (full payment)
- [ ] Starter → Pro upgrade works (prorated payment)
- [ ] Pro → Starter downgrade works (credit applied)
- [ ] Monthly → Annual change works (prorated)
- [ ] Annual → Monthly change works (prorated)
- [ ] Downgrade confirmation dialog appears
- [ ] Payment adjustment messages display correctly
- [ ] Webhook updates subscription correctly after payment

---

## 📝 Future Enhancements

1. **Subscription Management:**
   - Add customer portal for self-service plan changes
   - Show prorated amounts before checkout
   - Display credit balance in user dashboard

2. **Payment Methods:**
   - Support partial payments for upgrades
   - Handle refunds for downgrades
   - Store credit balance in database

3. **Notifications:**
   - Email confirmation for plan changes
   - Receipt with prorating breakdown
   - Credit balance notifications

---

## 🔗 Related Files

- `App.tsx` - Frontend plan selection and validation
- `supabase/functions/create-checkout/index.ts` - Checkout with prorating logic
- `supabase/functions/dodo-webhook/index.ts` - Webhook handler for payment events
- `constants.ts` - Plan definitions and pricing

---

**Last Updated:** 2024
**Version:** 1.0
