import type { SteeringBehavior } from './SteeringBehavior';
import { DirectChaseBehavior } from './DirectChaseBehavior';
import { FlankBehavior } from './FlankBehavior';
import { OrbitBehavior } from './OrbitBehavior';

type BehaviorCtor = () => SteeringBehavior;

const registry: Record<string, BehaviorCtor> = {
    direct: () => new DirectChaseBehavior(),
    flank: () => new FlankBehavior(),
    orbit: () => new OrbitBehavior(),
};

/** Look up a behavior by key and return a new instance. */
export function createBehavior(key: string): SteeringBehavior {
    const ctor = registry[key];
    if (!ctor) {
        console.warn(`Unknown behavior "${key}", falling back to "direct"`);
        return new DirectChaseBehavior();
    }
    return ctor();
}

/** Register a custom behavior so it can be referenced by key in enemies.json. */
export function registerBehavior(key: string, ctor: BehaviorCtor): void {
    registry[key] = ctor;
}
