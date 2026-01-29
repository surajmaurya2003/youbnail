"use client";

import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PLANS, Plan as PlanType } from "@/constants";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import { useModal } from "@/components/ui/use-modal";
import { AlertModal, ConfirmModal } from "@/components/ui/modal";

type Plan = "monthly" | "annually";

interface Pricing04Props {
  user?: any;
  isUpdatingPlan?: string | null;
  setIsUpdatingPlan?: (plan: string | null) => void;
}

export default function Pricing_04({ user, isUpdatingPlan, setIsUpdatingPlan }: Pricing04Props) {
  const [billPlan, setBillPlan] = useState<Plan>("monthly");
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const { 
    alertModal,
    confirmModal,
    showAlert,
    showConfirm,
    closeAlert,
    closeConfirm
  } = useModal();

  const handleSwitch = () => {
    setBillPlan((prev) => (prev === "monthly" ? "annually" : "monthly"));
  };

  const handlePlanClick = async (plan: PlanType, billingPeriod: string) => {
    if (!user) {
      showAlert('Authentication Required', 'Please sign in to update your plan', 'warning');
      return;
    }

    // Ensure user has valid authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      showAlert('Authentication Error', 'Please sign in again to continue', 'error');
      return;
    }

    // Check if this is the current plan
    const currentBilling = user?.subscription_billing_period || 'monthly';
    const normalizedBilling = billingPeriod === 'annually' ? 'annual' : billingPeriod;
    const normalizedCurrentBilling = currentBilling === 'annually' ? 'annual' : currentBilling;
    const isCurrentPlan = user?.plan === plan.id && normalizedCurrentBilling === normalizedBilling;
    
    if (isCurrentPlan) {
      showInfo('Already on Plan', 'You are already on this plan');
      return;
    }

    if (isUpdatingPlan) return;
    setIsUpdatingPlan?.(`${plan.id}-${billingPeriod}`);

    // Determine change type for payment adjustment
    const isUpgrade = (user.plan === 'free' || (user.plan === 'starter' && plan.id === 'pro'));
    const isDowngrade = user.plan === 'pro' && plan.id === 'starter';
    const isBillingChange = user.plan === plan.id && normalizedCurrentBilling !== normalizedBilling;
    
    // Check if user has active subscription for prorating
    const hasActiveSubscription = user.subscription_status === 'active' && user.subscription_id;
    
    const continueWithPlan = async () => {
      try {
        // Normalize billing period for backend (annually -> annual)
        const normalizedBillingPeriod = billingPeriod === 'annually' ? 'annual' : billingPeriod;

        // Get fresh session and token
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          throw new Error('Authentication session expired. Please sign in again.');
        }

        console.log('Making checkout request for user:', user.id, 'plan:', plan.id);
        console.log('Session status:', session ? 'valid' : 'invalid');
        console.log('Access token length:', session.access_token ? session.access_token.length : 0);
        
        // Call Supabase Edge Function to create checkout session
        const { data: sessionData, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
          body: {
            userId: user.id,
            planId: plan.id,
            billingPeriod: normalizedBillingPeriod,
            currentPlan: user.plan,
            currentBillingPeriod: user.subscription_billing_period || 'monthly',
            subscriptionId: user.subscription_id || null,
            hasActiveSubscription: hasActiveSubscription,
          }
        });

        console.log('Checkout response:', { sessionData, sessionError: checkoutError });

        if (checkoutError) {
          console.error('Checkout session error:', checkoutError);
          
          // Check if it's an auth error and suggest re-login
          if (checkoutError.message?.includes('Unauthorized') || checkoutError.message?.includes('401')) {
            throw new Error('Authentication failed. Please sign out and sign in again.');
          }
          
          throw new Error(checkoutError.message || 'Failed to create checkout session');
        }

        if (!sessionData?.checkout_url) {
          throw new Error('No checkout URL received');
        }

        // Show message about payment adjustment if applicable
        if (hasActiveSubscription && (isUpgrade || isDowngrade || isBillingChange)) {
          const adjustmentMessage = isUpgrade 
            ? 'Your payment will be prorated. You\'ll only pay the difference for the remaining billing period.'
            : isDowngrade
            ? 'Your payment will be adjusted. You\'ll receive a credit for the difference.'
            : 'Your payment will be prorated for the billing period change.';
          
          showInfo('Payment Information', `${adjustmentMessage}\n\nRedirecting to checkout...`);
        }

        // Redirect user to DodoPayments checkout page
        window.location.href = sessionData.checkout_url;
      } catch (error: any) {
        console.error('Checkout creation failed');
        showError('Checkout Failed', error.message || 'Please try again.');
        setIsUpdatingPlan?.(null);
      }
    };
    
    // Show confirmation for downgrades
    if (isDowngrade) {
      showConfirm(
        'Downgrade Confirmation',
        'Your payment will be prorated and credited to your account. You\'ll be charged the difference (if any) or receive a credit for the remaining time.',
        () => {
          continueWithPlan();
        },
        'warning',
        'Continue with Downgrade',
        'Cancel'
      );
      return;
    }
    
    continueWithPlan();
  };

  return (
    <div className="relative flex flex-col items-center justify-center max-w-5xl py-[10px] mx-auto mt-[5px]">
      <div className="flex flex-col items-center justify-center max-w-2xl mx-auto">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mt-6" style={{color: 'var(--text-primary)'}}>
            Pricing
          </h2>
          <p className="text-base text-center mt-6" style={{color: 'var(--text-secondary)'}}>
            Streamline your creative process with AI. Generate, manage, and publish content — all in one place.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center mt-6">
          <div
            className="inline-flex items-center rounded-full p-1 border"
            style={{ 
              background: 'var(--bg-tertiary)', 
              borderColor: 'var(--border-primary)'
            }}
          >
            <button
              type="button"
              onClick={() => setBillPlan('monthly')}
              className={cn(
                "px-4 py-1 text-sm font-medium rounded-full transition-colors",
                billPlan === 'monthly'
                  ? "bg-[var(--accent-primary)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillPlan('annually')}
              className={cn(
                "px-4 py-1 text-sm font-medium rounded-full transition-colors",
                billPlan === 'annually'
                  ? "bg-[var(--accent-primary)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              Annually
            </button>
          </div>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 lg:grid-cols-2 pt-8 lg:pt-12 gap-4 lg:gap-6 max-w-4xl mx-auto">
        {PLANS.map((plan) => (
          <PlanCard 
            key={plan.id} 
            plan={plan} 
            billPlan={billPlan}
            user={user}
            isUpdatingPlan={isUpdatingPlan}
            onPlanClick={handlePlanClick}
          />
        ))}
      </div>
      
      {/* Modal Components */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        confirmText={alertModal.confirmText}
      />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
      />
    </div>
  );
}

const PlanCard = ({ 
  plan, 
  billPlan, 
  user,
  isUpdatingPlan,
  onPlanClick
}: { 
  plan: PlanType; 
  billPlan: Plan;
  user?: any;
  isUpdatingPlan?: string | null;
  onPlanClick: (plan: PlanType, billingPeriod: string) => void;
}) => {
  const price = billPlan === "monthly" ? plan.priceMonthly : plan.priceAnnual;
  const annualPrice = plan.priceAnnual * 12;
  const monthlyPriceTotal = plan.priceMonthly * 12;
  
  // Check if this is the current plan
  const currentBilling = user?.subscription_billing_period || 'monthly';
  const normalizedBilling = billPlan === 'annually' ? 'annual' : billPlan;
  const normalizedCurrentBilling = currentBilling === 'annually' ? 'annual' : currentBilling;
  const isCurrentPlan = user?.plan === plan.id && normalizedCurrentBilling === normalizedBilling;
  const planKey = `${plan.id}-${billPlan}`;
  const isUpdatingThisPlan = isUpdatingPlan === planKey;

  // Get only included features
  const includedFeatures = plan.features
    .filter(f => f.included)
    .map(f => f.name);

  return (
    <div 
      className={cn(
        "flex flex-col relative rounded-2xl lg:rounded-3xl transition-all bg-background items-start w-full border",
        isCurrentPlan 
          ? "border-2 ring-2 ring-offset-2" 
          : plan.popular 
          ? "border-2" 
          : "border",
        isCurrentPlan ? "ring-[var(--accent-primary)]" : ""
      )}
      style={{
        borderColor: isCurrentPlan 
          ? 'var(--accent-primary)' 
          : plan.popular 
          ? 'var(--accent-primary)' 
          : 'var(--border-primary)',
        background: isCurrentPlan
          ? 'rgba(239, 68, 68, 0.1)'
          : plan.popular 
          ? 'rgba(239, 68, 68, 0.05)' 
          : 'var(--bg-card)',
        boxShadow: isCurrentPlan
          ? '0 0 40px rgba(239, 68, 68, 0.3)'
          : plan.popular 
          ? '0 0 30px rgba(239, 68, 68, 0.2)' 
          : 'var(--shadow-md)',
      }}
    >
      {plan.popular && !isCurrentPlan && (
        <div 
          className="absolute top-1/2 inset-x-0 mx-auto h-12 -rotate-45 w-full rounded-2xl lg:rounded-3xl blur-[8rem] -z-10"
          style={{background: 'var(--accent-primary)'}}
        ></div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div 
          className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold text-white z-10"
          style={{
            background: 'linear-gradient(135deg, var(--accent-primary), #dc2626)',
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.5)'
          }}
        >
          ✓ CURRENT PLAN
        </div>
      )}

      {/* Popular Badge */}
      {plan.popular && !isCurrentPlan && (
        <div 
          className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold text-white z-10"
          style={{
            background: 'linear-gradient(135deg, var(--accent-primary), #dc2626)',
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.5)'
          }}
        >
          BEST VALUE
        </div>
      )}

      <div className="p-4 md:p-8 flex rounded-t-2xl lg:rounded-t-3xl flex-col items-start w-full relative">
        <h2 className="font-semibold text-xl pt-5" style={{color: 'var(--text-primary)'}}>
          {plan.name}
        </h2>
        <h3 className="mt-3 text-2xl font-bold md:text-5xl" style={{color: 'var(--accent-primary)'}}>
          <NumberFlow
            value={billPlan === "monthly" ? plan.priceMonthly : plan.priceAnnual}
            suffix={billPlan === "monthly" ? "/mo" : "/mo"}
            format={{
              currency: "USD",
              style: "currency",
              currencySign: "standard",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
              currencyDisplay: "narrowSymbol"
            }}
          />
        </h3>
        <p className="text-sm md:text-base mt-2" style={{color: 'var(--text-secondary)'}}>
          {billPlan === "monthly" 
            ? `Generate up to ${plan.thumbnailsMonthly} thumbnails per month. ${plan.creditsMonthly} credits.`
            : `Generate up to ${plan.thumbnailsAnnual} thumbnails per year. ${plan.creditsAnnual} credits.`}
        </p>
      </div>
      
      <div className="flex flex-col items-start w-full px-4 py-2 md:px-8">
        <Button 
          size="lg" 
          className={cn(
            "w-full hover:border-[var(--accent-primary)]",
            isCurrentPlan && "cursor-default"
          )}
          onClick={() => onPlanClick(plan, billPlan)}
          disabled={isCurrentPlan || isUpdatingThisPlan}
          style={{
            background: isCurrentPlan
              ? 'linear-gradient(135deg, var(--accent-primary), #dc2626)'
              : plan.popular 
              ? 'var(--bg-tertiary)'
              : 'var(--bg-tertiary)',
            color: isCurrentPlan ? 'white' : 'white',
            border: isCurrentPlan 
              ? '2px solid var(--accent-primary)' 
              : '1px solid rgba(239, 68, 68, 0.3)'
          }}
        >
          {isUpdatingThisPlan ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2"></div>
              Updating...
            </>
          ) : isCurrentPlan ? (
            'Current Plan'
          ) : user?.plan === 'free' ? (
            'Choose Plan'
          ) : (
            'Update Plan'
          )}
        </Button>
        <div className="h-8 overflow-hidden w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.span
              key={billPlan}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="text-sm text-center mt-3 mx-auto block"
              style={{color: 'var(--text-muted)'}}
            >
              {billPlan === "monthly" ? (
                "Billed monthly"
              ) : (
                `Billed $${annualPrice} annually (Save $${monthlyPriceTotal - annualPrice})`
              )}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
      
      <div className="flex flex-col items-start w-full p-5 mb-4 ml-1 gap-y-2">
        <span className="text-base font-semibold text-left mb-2" style={{color: 'var(--text-primary)'}}>
          Includes: 
        </span>
        {includedFeatures.map((feature, index) => (
          <div key={index} className="flex items-center justify-start gap-2">
            <div className="flex items-center justify-center">
              <CheckIcon className="size-5" style={{color: 'var(--accent-primary)'}} />
            </div>
            <span style={{color: 'var(--text-primary)'}}>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
