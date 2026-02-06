'use client';
import React, { useState } from 'react';
import { PlusIcon, ShieldCheckIcon, X, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from './badge';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { BorderTrail } from './border-trail';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/toast';

interface CreatorPricingProps {
  user?: any;
  isUpdatingPlan?: string | null;
  setIsUpdatingPlan?: (plan: string | null) => void;
  onPlanSelect?: (planId: string) => void;
}

export function CreatorPricing({ user, isUpdatingPlan, setIsUpdatingPlan, onPlanSelect }: CreatorPricingProps) {
	const { showSuccess, showError, showInfo } = useToast();
	const [showCancelModal, setShowCancelModal] = useState(false);
	const [selectedPlan, setSelectedPlan] = useState<{id: string, price: number, billingPeriod: 'monthly' | 'annually'} | null>(null);
	const [isCancelling, setIsCancelling] = useState(false);

	const handlePlanClick = async (planId: string, planPrice: number, billingPeriod: 'monthly' | 'annually') => {
		if (onPlanSelect) {
			onPlanSelect(planId);
			return;
		}

		if (!user) {
			// For non-authenticated users, redirect to signup
			window.location.href = '/signup';
			return;
		}

		// Check if this is the current plan
		const isCurrentPlan = user?.plan === planId;
		if (isCurrentPlan) {
			showInfo('Already on Plan', 'You are already on this plan');
			return;
		}

		// Check if user has an active subscription that needs to be cancelled first
		const hasActiveSubscription = user?.subscription_status === 'active' && user?.subscription_id;
		if (hasActiveSubscription) {
			// Show cancellation modal instead of proceeding to checkout
			setSelectedPlan({ id: planId, price: planPrice, billingPeriod });
			setShowCancelModal(true);
			return;
		}

		// Prevent double-clicks
		if (isUpdatingPlan) {
			return;
		}
		
		setIsUpdatingPlan?.(planId);

		try {
			// Get fresh session and token
			const { data: { session }, error: sessionError } = await supabase.auth.getSession();
			if (sessionError || !session) {
				throw new Error('Authentication session expired. Please sign in again.');
			}

			// Call Supabase Edge Function to create checkout session
			console.log('Session info:', { 
				userId: session.user.id, 
				accessToken: session.access_token ? 'present' : 'missing',
				tokenLength: session.access_token?.length 
			});
			
			// Normalize billing period to match backend expectations
			const normalizedBillingPeriod = billingPeriod === 'annually' ? 'annual' : billingPeriod;
			
			const { data: sessionData, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
				body: { 
					planId,
					billingPeriod: normalizedBillingPeriod
				}
			});

			if (checkoutError) {
				console.error('Detailed checkout error:', checkoutError);
				console.error('Error message:', checkoutError.message);
				console.error('Error details:', checkoutError.details);
				throw new Error(checkoutError.message || 'Failed to create checkout session');
			}

			if (!sessionData?.checkout_url) {
				throw new Error('No checkout URL received');
			}

			// Redirect user to DodoPayments checkout page
			window.location.href = sessionData.checkout_url;

		} catch (error: any) {
			console.error('Checkout error:', error);
			showError('Payment Error', error.message || 'Failed to initiate checkout');
			setIsUpdatingPlan?.(null);
		}
	};

	// Handle subscription cancellation
	const handleCancelSubscription = async () => {
		setIsCancelling(true);
		try {
			const { data: { session }, error: sessionError } = await supabase.auth.getSession();
			if (sessionError || !session) {
				throw new Error('Please sign in again');
			}

			const { data, error } = await supabase.functions.invoke('cancel-subscription', {
				body: { userId: user.id },
				headers: {
					Authorization: `Bearer ${session.access_token}`,
				},
			});

			if (error) {
				throw new Error(error.message || 'Failed to cancel subscription');
			}

			showSuccess('Subscription Cancelled', 'Your subscription has been cancelled successfully');
			setShowCancelModal(false);
			
			// Refresh the page to show updated subscription state
			setTimeout(() => {
				window.location.reload();
			}, 1500);
			
			// Wait a moment then proceed with the new plan (after page refresh)
			setTimeout(() => {
				if (selectedPlan) {
					handlePlanClick(selectedPlan.id, selectedPlan.price, selectedPlan.billingPeriod);
				}
			}, 2000);

		} catch (error: any) {
			console.error('Cancellation error:', error);
			showError('Cancellation Failed', error.message);
		} finally {
			setIsCancelling(false);
		}
	};

	const isCurrentPlanMonthly = user?.plan === 'creator-monthly';
	const isCurrentPlanYearly = user?.plan === 'creator-yearly';
	return (
		<>
			{/* Cancellation Modal */}
			{showCancelModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
					>
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center space-x-2">
								<AlertTriangle className="h-6 w-6 text-orange-500" />
								<h3 className="text-lg font-semibold text-gray-900">Cancel Current Subscription</h3>
							</div>
							<button
								onClick={() => setShowCancelModal(false)}
								className="text-gray-400 hover:text-gray-600"
							>
								<X className="h-5 w-5" />
							</button>
						</div>
						
						<div className="mb-6">
							<p className="text-gray-600 mb-4">
								To upgrade your plan, you need to cancel your current subscription first. This ensures you're not charged for both plans.
							</p>
							<p className="text-sm text-gray-500">
								<strong>Current plan:</strong> {user?.plan?.replace('-', ' ')?.replace(/\b\w/g, (l: string) => l.toUpperCase())}
							</p>
							<p className="text-sm text-gray-500">
								<strong>New plan:</strong> {selectedPlan?.id?.replace('-', ' ')?.replace(/\b\w/g, (l: string) => l.toUpperCase())}
							</p>
						</div>
						
						<div className="flex space-x-3">
							<Button
								variant="outline"
								onClick={() => setShowCancelModal(false)}
								className="flex-1"
								disabled={isCancelling}
							>
								Cancel
							</Button>
							<Button
								onClick={handleCancelSubscription}
								className="flex-1"
								disabled={isCancelling}
							>
								{isCancelling ? 'Cancelling...' : 'Cancel & Upgrade'}
							</Button>
						</div>
					</motion.div>
				</div>
			)}
			<section className="relative overflow-hidden py-4 px-4 sm:py-8">
				<div id="pricing" className="mx-auto w-full max-w-6xl space-y-3 sm:space-y-5">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
					viewport={{ once: true }}
					className="mx-auto max-w-xl space-y-5"
				>
					<div className="flex justify-center">
						<div className="rounded-lg border px-4 py-1 font-mono" style={{borderColor: 'var(--border-primary)', color: 'var(--text-primary)'}}>Pricing</div>
					</div>
					<h2 className="mt-3 sm:mt-5 text-center text-lg font-bold tracking-tighter sm:text-xl md:text-2xl" style={{color: 'var(--text-primary)'}}>
						Creator Plans Made Simple
					</h2>
					<p className="mt-2 sm:mt-5 text-center text-sm" style={{color: 'var(--text-secondary)'}}>
						Two simple plans. All features included. Pick what works for you.
					</p>
				</motion.div>

				<div className="relative">
					<div
						className={cn(
							'z--10 pointer-events-none absolute inset-0 size-full',
							'bg-[linear-gradient(to_right,var(--border-primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-primary)_1px,transparent_1px)]',
							'bg-[size:32px_32px]',
							'[mask-image:radial-gradient(ellipse_at_center,var(--bg-primary)_10%,transparent)]',
						)}
					/>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
						viewport={{ once: true }}
						className="mx-auto w-full max-w-4xl space-y-2"
					>	
						<div className="grid grid-cols-1 md:grid-cols-2 relative border gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6 md:p-8 rounded-lg" style={{background: 'var(--bg-primary)', borderColor: 'var(--border-primary)'}}>
							<PlusIcon className="absolute -top-3 -left-3 size-5" style={{color: 'var(--text-primary)'}} />
							<PlusIcon className="absolute -top-3 -right-3 size-5" style={{color: 'var(--text-primary)'}} />
							<PlusIcon className="absolute -bottom-3 -left-3 size-5" style={{color: 'var(--text-primary)'}} />
							<PlusIcon className="absolute -right-3 -bottom-3 size-5" style={{color: 'var(--text-primary)'}} />

							{/* Monthly Plan */}
							<div className="flex flex-col h-full">
								<div className="flex-1">
									<div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
										<h3 className="text-base font-semibold" style={{color: 'var(--text-primary)'}}>Creator Monthly</h3>
										<div className="flex items-center gap-x-2">
											<span className="text-xs line-through" style={{color: 'var(--text-muted)'}}>$40.00</span>
											{!isCurrentPlanMonthly && <Badge variant="secondary">Most Popular</Badge>}
											{isCurrentPlanMonthly && <Badge variant="default">Current Plan</Badge>}
										</div>
									</div>
									<p className="text-sm mb-3 sm:mb-5" style={{color: 'var(--text-secondary)'}}>Perfect for active creators</p>
									
									{/* Features List */}
									<div className="mb-4 sm:mb-6">
										<div className="text-xs font-semibold mb-3" style={{color: 'var(--accent-primary)'}}>
											✨ What's included:
										</div>
										<ul className="text-xs space-y-2" style={{color: 'var(--text-secondary)'}}>
											<li>• 50 AI-generated thumbnails/month</li>
											<li>• Prompt-to-Thumbnail Generation</li>
											<li>• Reference Image & Video Snapshot</li>
											<li>• HD downloads (16:9 & 9:16)</li>
											<li>• 8 premium themes & text overlay</li>
											<li>• Selective region editing</li>
											<li>• Style & lighting controls</li>
											<li>• Gallery & history</li>
											<li>• Priority support</li>
											<li>• Early access to new features</li>
										</ul>
									</div>
								</div>
								
								{/* Pricing & CTA */}
								<div className="mt-auto space-y-4">
									<div className="space-y-1">
										<div className="flex items-end gap-1" style={{color: 'var(--text-secondary)'}}>
											<span className="text-lg">$</span>
											<span className="text-3xl font-extrabold" style={{color: 'var(--text-primary)'}}>25</span>
											<span className="text-lg">/month</span>
										</div>
										<p className="text-xs" style={{color: 'var(--text-muted)'}}>
											$25.00 billed monthly
										</p>
									</div>
									<Button 
										className="w-full" 
										variant={isCurrentPlanMonthly ? "default" : "outline"} 
										disabled={isCurrentPlanMonthly || isUpdatingPlan === 'creator-monthly'}
										onClick={() => handlePlanClick('creator-monthly', 25, 'monthly')}
									>
										{isCurrentPlanMonthly ? '✓ Current Plan' : isUpdatingPlan === 'creator-monthly' ? 'Processing...' : 'Choose Monthly →'}
									</Button>
								</div>
							</div>
							{/* Yearly Plan */}
							<div className="relative flex flex-col h-full rounded-lg border p-4 sm:p-6" style={{borderColor: 'var(--accent-primary)'}}>
								<BorderTrail
									style={{
										boxShadow:
											'0px 0px 60px 30px rgb(239 68 68 / 20%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)',
									}}
									size={100}
									className="bg-[var(--accent-primary)]"
								/>
								
								<div className="flex-1">
									<div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
										<h3 className="text-base font-semibold" style={{color: 'var(--text-primary)'}}>Creator Yearly</h3>
										<div className="flex items-center gap-x-2">
											<span className="text-xs line-through" style={{color: 'var(--text-muted)'}}>$300</span>
											{!isCurrentPlanYearly && <Badge>Save $50</Badge>}
											{isCurrentPlanYearly && <Badge variant="default">Current Plan</Badge>}
										</div>
									</div>
									<p className="text-sm mb-3 sm:mb-5" style={{color: 'var(--text-secondary)'}}>Best value for serious creators</p>
									
									{/* Features List */}
									<div className="mb-4 sm:mb-6">
										<div className="text-xs font-semibold mb-3" style={{color: 'var(--accent-primary)'}}>
											✨ Everything in Monthly plus:
										</div>
										<ul className="text-xs space-y-2" style={{color: 'var(--text-secondary)'}}>
											<li>• 600 AI-generated thumbnails/year</li>
											<li>• Save $50 with annual billing</li>
											<li>• Premium email support</li>
											<li>• Priority early access to new features</li>
										</ul>
									</div>
									
									{/* Value Proposition */}
									<div className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg" style={{
										background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.03) 100%)',
										borderLeft: '3px solid var(--accent-primary)',
										boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
									}}>
										<div className="text-xs font-semibold mb-1 sm:mb-2" style={{color: 'var(--accent-primary)'}}>
											💰 Best Value Deal
										</div>
										<p className="text-xs" style={{color: 'var(--text-secondary)'}}>
											Get 2 months free when you choose yearly billing. That's 12 months of premium thumbnail creation for the price of 10!
										</p>
									</div>
								</div>
								
								{/* Pricing & CTA */}
								<div className="mt-auto space-y-4">
									<div className="space-y-1">
										<div className="flex items-end gap-1" style={{color: 'var(--text-secondary)'}}>
											<span className="text-lg">$</span>
											<span className="text-3xl font-extrabold" style={{color: 'var(--text-primary)'}}>20.83</span>
											<span className="text-lg">/month</span>
										</div>
										<p className="text-xs" style={{color: 'var(--text-muted)'}}>
											$250.00 billed annually
										</p>
									</div>
									<Button 
										className="w-full" 
										variant={isCurrentPlanYearly ? "default" : undefined}
										disabled={isCurrentPlanYearly || isUpdatingPlan === 'creator-yearly'}
										onClick={() => handlePlanClick('creator-yearly', 250, 'annually')}
									>
										{isCurrentPlanYearly ? '✓ Current Plan' : isUpdatingPlan === 'creator-yearly' ? 'Processing...' : 'Choose Yearly →'}
									</Button>
								</div>
							</div>
						</div>

						<div className="flex items-center justify-center gap-x-2 text-sm pt-4" style={{color: 'var(--text-secondary)'}}>
							<ShieldCheckIcon className="size-4" />
							<span>All features included • 50 credits monthly • 600 credits yearly</span>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
		</>
	);
}