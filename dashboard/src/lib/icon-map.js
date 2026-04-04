import {
  Rocket, ArrowUp, Flame, Moon, Globe, Zap, Waves,
  Clock, Activity, Navigation
} from 'lucide-react';

export const EVENT_ICONS = {
  'launch': Rocket,
  'perigee-raise': ArrowUp,
  'tli-burn': Flame,
  'lunar-flyby': Moon,
  'return-coast': Globe,
  'entry-interface': Zap,
  'splashdown': Waves,
};

export const METRIC_ICONS = {
  met: Clock,
  velocity: Activity,
  distEarth: Globe,
  distMoon: Moon,
};
