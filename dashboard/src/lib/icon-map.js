import {
  Rocket, ArrowUp, Flame, Moon, Globe, Zap, Waves,
  Clock, Activity, Navigation,
  Users, Compass, Award, Eye, Sunrise, Eclipse, Star, Radio,
  Scissors, Umbrella,
} from 'lucide-react';

export const EVENT_ICONS = {
  'launch': Rocket,
  'perigee-raise': ArrowUp,
  'tli-burn': Flame,
  'otc-burn': Flame,
  'crew-activity': Users,
  'lunar-soi': Compass,
  'distance-record': Award,
  'lunar-observation': Eye,
  'earthset': Radio,
  'lunar-flyby': Moon,
  'max-distance': Star,
  'earthrise': Sunrise,
  'solar-eclipse': Eclipse,
  'return-coast': Globe,
  'live-coverage': Radio,
  'separation': Scissors,
  'entry-interface': Zap,
  'parachute': Umbrella,
  'splashdown': Waves,
};

export const METRIC_ICONS = {
  met: Clock,
  velocity: Activity,
  distEarth: Globe,
  distMoon: Moon,
};
