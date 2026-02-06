'use client';
import React from 'react';
import { PlusIcon, ShieldCheckIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from './badge';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { BorderTrail } from './border-trail';

export function HomepagePricing() {
	const handlePlanClick = (planId: string) => {
		// Always redirect to signup page for homepage pricing
		window.location.href = 'https://youbnail.com/signup';
	};

	return (
		<section className="relative overflow-hidden py-4 px-4 sm:py-8">
			<div id="pricing" className="mx-auto w-full max-w-6xl space-y-3 sm:space-y-5">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				viewport={{ once: true }}
				className="text-center"
			>
				<div className="mb-4 inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium" style={{borderColor: 'var(--border-muted)', background: 'var(--bg-secondary)', color: 'var(--text-muted)'}}>
					<span>Simple Pricing</span>
				</div>
				<h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4" style={{color: 'var(--text-primary)'}}>
					Choose Your Plan
				</h2>
				<p className="mx-auto max-w-2xl text-lg" style={{color: 'var(--text-secondary)'}}>
					Start creating professional thumbnails today. All plans include the full feature set.
				</p>
			</motion.div>

			<div className="mx-auto grid max-w-lg gap-6 lg:max-w-none lg:grid-cols-2 lg:gap-8">
				{/* Monthly Plan */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					viewport={{ once: true }}
					className="relative flex flex-col overflow-hidden rounded-2xl border"
					style={{borderColor: 'var(--border-muted)', background: 'var(--bg-primary)'}}
				>
					<div className="flex-1 p-6 lg:p-8">
						<div className="mb-6">
							<h3 className="text-xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>Creator Monthly</h3>
							<div className="flex items-baseline">
								<span className="text-4xl font-bold" style={{color: 'var(--text-primary)'}}>$25</span>
								<span className="ml-2 text-lg" style={{color: 'var(--text-muted)'}}>/month</span>
							</div>
							<p className="mt-2 text-sm" style={{color: 'var(--text-muted)'}}>Perfect for content creators</p>
						</div>

						<div className="space-y-4">
							<div className="space-y-3">
								<ul className="space-y-3 text-sm" style={{color: 'var(--text-secondary)'}}>
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
							<Button
								onClick={() => handlePlanClick('creator-monthly')}
								className="w-full justify-center rounded-lg px-4 py-3 text-sm font-medium transition-colors"
								style={{
									backgroundColor: 'var(--bg-primary)',
									color: 'var(--text-primary)',
									border: '1px solid var(--border-muted)'
								}}
							>
								Choose Monthly →
							</Button>
						</div>
					</div>
				</motion.div>

				{/* Yearly Plan */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					viewport={{ once: true }}
					className="relative flex flex-col overflow-hidden rounded-2xl border-2"
					style={{borderColor: '#ef4444', background: 'var(--bg-primary)'}}
				>
					<BorderTrail
						style={{
							boxShadow:
								'0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)',
						}}
						size={100}
					/>
					
					{/* Popular badge */}
					<div className="absolute -top-3 left-1/2 -translate-x-1/2">
						<Badge variant="default" style={{backgroundColor: '#ef4444', color: 'white', padding: '4px 16px', fontSize: '12px', fontWeight: '600'}}>
							🔥 Best Value Deal
						</Badge>
					</div>

					<div className="flex-1 p-6 lg:p-8">
						<div className="mb-6">
							<h3 className="text-xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>Creator Yearly</h3>
							<div className="flex items-baseline">
								<span className="text-4xl font-bold" style={{color: 'var(--text-primary)'}}>$20.83</span>
								<span className="ml-2 text-lg" style={{color: 'var(--text-muted)'}}>/month</span>
							</div>
							<p className="mt-1 text-sm font-medium text-green-600">$250.00 billed annually</p>
							<p className="mt-2 text-sm" style={{color: 'var(--text-muted)'}}>Best value for serious creators</p>
						</div>

						<div className="mb-6">
							<div className="rounded-lg p-3" style={{background: 'var(--accent-light)'}}>
								<div className="flex items-center space-x-2">
									<span className="text-sm font-semibold" style={{color: 'var(--accent-primary)'}}>✨ Everything in Monthly plus:</span>
								</div>
								<ul className="mt-2 space-y-1 text-sm" style={{color: 'var(--text-secondary)'}}>
									<li>• 600 AI-generated thumbnails/year</li>
									<li>• Save $50 with annual billing</li>
									<li>• Premium email support</li>
									<li>• Priority early access to new features</li>
								</ul>
							</div>
						</div>

						<div className="space-y-4">
							<div className="rounded-lg border p-4" style={{borderColor: 'var(--border-muted)', background: 'var(--bg-secondary)'}}>
								<div className="flex items-center space-x-2">
									<span className="text-sm font-semibold text-red-600">🔥 Best Value Deal</span>
								</div>
								<p className="mt-1 text-sm" style={{color: 'var(--text-secondary)'}}>
									Get 2 months free when you choose yearly billing. 
									That's 12 months of premium thumbnail creation for the price of 10!
								</p>
							</div>
							
							<div className="space-y-3">
								<ul className="space-y-3 text-sm" style={{color: 'var(--text-secondary)'}}>
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
							<Button
								onClick={() => handlePlanClick('creator-yearly')}
								className="w-full justify-center rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700"
							>
								Choose Yearly →
							</Button>
						</div>
					</div>
				</motion.div>

				<div className="flex items-center justify-center gap-x-2 text-sm pt-4" style={{color: 'var(--text-secondary)'}}>
					<ShieldCheckIcon className="size-4" />
					<span>All features included • 50 credits monthly • 600 credits yearly</span>
				</div>
			</div>
		</div>
	</section>
	);
}