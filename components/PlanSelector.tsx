
import React from 'react';
import { PLANS } from '../constants';
import { PlanTier } from '../types';

interface PlanSelectorProps {
  currentPlan: PlanTier;
  onSelect: (tier: PlanTier) => void;
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({ currentPlan, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {PLANS.map((plan) => (
        <div 
          key={plan.id}
          className={`card p-8 text-center transition-all duration-300 border-2 ${
            currentPlan === plan.id 
              ? 'border-gray-600 bg-gray-100' 
              : 'border-gray-200 hover:border-red-300'
          } ${plan.id === 'pro' ? 'relative overflow-hidden' : ''}`}
        >
          {plan.id === 'pro' && (
            <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-4 py-1 transform translate-x-2 -translate-y-1">
              POPULAR
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>
              {plan.name}
            </h3>
            <div className="flex items-baseline justify-center mb-4">
              <span className="text-4xl font-bold" style={{color: 'var(--accent-primary)'}}>
                {plan.price}
              </span>
              <span className="text-lg ml-2" style={{color: 'var(--text-muted)'}}>
                /month
              </span>
            </div>
            <div className="inline-block px-4 py-2 rounded-full text-sm font-medium" style={{background: 'var(--accent-light)', color: 'var(--accent-primary)'}}>
              {plan.credits} credits included
            </div>
          </div>
          
          <ul className="space-y-4 mb-8 text-left">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start text-sm">
                <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" style={{color: 'var(--accent-primary)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span style={{color: 'var(--text-secondary)'}}>{feature}</span>
              </li>
            ))}
          </ul>
          
          <button
            onClick={() => onSelect(plan.id as PlanTier)}
            disabled={currentPlan === plan.id}
            className={`w-full py-4 rounded-lg font-semibold text-sm transition-all ${
              currentPlan === plan.id
                ? 'cursor-default opacity-60 bg-gray-100 text-gray-500'
                : plan.id === 'pro' 
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg'
                  : 'bg-black text-white hover:bg-gray-900'
            }`}
          >
            {currentPlan === plan.id ? 'Current Plan' : 'Choose Plan'}
          </button>
        </div>
      ))}
    </div>
  );
};
