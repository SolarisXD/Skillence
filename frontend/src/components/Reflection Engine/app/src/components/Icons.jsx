// Icon Components Using lucide-react
import React from 'react';
import { 
  Bot, 
  Target, 
  Rocket, 
  Hand, 
  HelpCircle, 
  Search, 
  Brain, 
  BarChart3, 
  Sparkles, 
  Star, 
  Zap, 
  Lightbulb, 
  X, 
  CheckCircle, 
  User, 
  PersonStanding 
} from 'lucide-react';

// Robot Icon (replacing 🤖)
export const RobotIcon = (props) => (
  <Bot {...props} />
);

// Target Icon (replacing 🎯)
export const TargetIcon = (props) => (
  <Target {...props} />
);

// Rocket Icon (replacing 🚀)
export const RocketIcon = (props) => (
  <Rocket {...props} />
);

// Wave Icon (replacing 👋)
export const WaveIcon = (props) => (
  <Hand {...props} />
);

// Thinking Icon (replacing 🤔)
export const ThinkingIcon = (props) => (
  <HelpCircle {...props} />
);

// Search Icon (replacing 🔍)
export const SearchIcon = (props) => (
  <Search {...props} />
);

// Brain Icon (replacing 🧠)
export const BrainIcon = (props) => (
  <Brain {...props} />
);

// Chart Icon (replacing 📊)
export const ChartIcon = (props) => (
  <BarChart3 {...props} />
);

// Sparkles Icon (replacing ✨)
export const SparklesIcon = (props) => (
  <Sparkles {...props} />
);

// Star Icon (replacing 🌟)
export const StarIcon = (props) => (
  <Star {...props} />
);

// Muscle Icon (replacing 💪)
export const MuscleIcon = (props) => (
  <Zap {...props} />
);

// Lightbulb Icon (replacing 💡)
export const LightbulbIcon = (props) => (
  <Lightbulb {...props} />
);

// X Icon (replacing ❌)
export const XIcon = (props) => (
  <X {...props} />
);

// Check Icon (replacing ✅)
export const CheckIcon = (props) => (
  <CheckCircle {...props} />
);

// User Icon (replacing 👤)
export const UserIcon = (props) => (
  <User {...props} />
);

// Running Icon (replacing 🏃‍♂️)
export const RunningIcon = (props) => (
  <PersonStanding {...props} />
);

export default {
  Robot: RobotIcon,
  Target: TargetIcon,
  Rocket: RocketIcon,
  Wave: WaveIcon,
  Thinking: ThinkingIcon,
  Search: SearchIcon,
  Brain: BrainIcon,
  Chart: ChartIcon,
  Sparkles: SparklesIcon,
  Star: StarIcon,
  Muscle: MuscleIcon,
  Lightbulb: LightbulbIcon,
  X: XIcon,
  Check: CheckIcon,
  User: UserIcon,
  Running: RunningIcon
};