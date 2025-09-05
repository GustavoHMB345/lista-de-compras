import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export const PlusIcon = () => (
	<Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
		<Path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth={2.5} strokeLinecap="round"/>
	</Svg>
);
export const EditIcon = () => <Text style={{fontSize: 18}}>✏️</Text>;
export const CheckIcon = () => <Text style={{color: '#22c55e', fontSize: 18}}>✔️</Text>;
export const BackIcon = () => <Text style={{fontSize: 20}}>⬅️</Text>;

// Generic gradient badge wrapper for icons (matches navbar style)
const GradientBadge = ({ size = 44, colors = ['#6C7DFF', '#4F46E5'], children }) => (
	<LinearGradient
		colors={colors}
		start={{ x: 0, y: 0 }}
		end={{ x: 1, y: 1 }}
		style={{
			width: size,
			height: size,
			borderRadius: size / 2,
			alignItems: 'center',
			justifyContent: 'center',
			shadowColor: '#6C7DFF',
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.25,
			shadowRadius: 6,
			elevation: 4,
		}}
	>
		{children}
	</LinearGradient>
);

// Simple white stroked/filled icons for categories
const FoodGlyph = ({ size = 24 }) => (
	<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<Path d="M7 2v8M11 2v8M9 10v12" stroke="#fff" strokeWidth={2} strokeLinecap="round"/>
		<Path d="M16 3c2.5 0 4 1.5 4 4v6h-2v9h-4v-9h-2V7c0-2.5 1.5-4 4-4Z" fill="#fff" opacity={0.85}/>
	</Svg>
);
const CleaningGlyph = ({ size = 24 }) => (
	<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<Path d="M5 21h10l2-10H7l-2 10Z" fill="#fff" opacity={0.9}/>
		<Path d="M12 3v6M9 3h6" stroke="#fff" strokeWidth={2} strokeLinecap="round"/>
	</Svg>
);
const TechGlyph = ({ size = 24 }) => (
	<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<Path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z" stroke="#fff" strokeWidth={2}/>
		<Path d="M2 18h20" stroke="#fff" strokeWidth={2} strokeLinecap="round"/>
	</Svg>
);
const ClothingGlyph = ({ size = 24 }) => (
	<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<Path d="M8 5 12 7l4-2 2 3-3 2v9H9V10L6 8l2-3Z" fill="#fff" opacity={0.9}/>
	</Svg>
);
const FurnitureGlyph = ({ size = 24 }) => (
	<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<Path d="M3 12h18v6H3z" fill="#fff" opacity={0.9}/>
		<Path d="M6 18v3M18 18v3" stroke="#fff" strokeWidth={2} strokeLinecap="round"/>
	</Svg>
);
const OtherGlyph = ({ size = 24 }) => (
	<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<Path d="M4 7h10l6 6v6H4V7Z" stroke="#fff" strokeWidth={2}/>
		<Path d="M8 13h4" stroke="#fff" strokeWidth={2} strokeLinecap="round"/>
	</Svg>
);

const categoryGradient = (key) => {
	switch (key) {
		case 'alimentos': return ['#6C7DFF', '#4F46E5'];
		case 'limpeza': return ['#22c55e', '#16a34a'];
		case 'tecnologia': return ['#06b6d4', '#0284c7'];
		case 'vestuario': return ['#f97316', '#ef4444'];
		case 'moveis': return ['#8b5cf6', '#6366f1'];
		default: return ['#7C7C8A', '#23232B'];
	}
};

const glyphFor = (key) => {
	switch (key) {
		case 'alimentos': return FoodGlyph;
		case 'limpeza': return CleaningGlyph;
		case 'tecnologia': return TechGlyph;
		case 'vestuario': return ClothingGlyph;
		case 'moveis': return FurnitureGlyph;
		default: return OtherGlyph;
	}
};

export const CategoryIcon = ({ type = 'outros', size = 44, neutral = false }) => {
	const Glyph = glyphFor(type);
	const colors = neutral ? ['#737373', '#404040'] : categoryGradient(type);
	const inner = Math.round(size * 0.55);
	return (
		<GradientBadge size={size} colors={colors}>
			<Glyph size={inner} />
		</GradientBadge>
	);
};