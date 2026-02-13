export type PetType = 'gato' | 'perro' | 'dino' | 'axolote' | 'pajaro' | 'zorro' | 'panda' | 'robot';

export interface PetDefinition {
    id: PetType;
    name: string;
    stages: string[]; // Emojis para cada fase evolutiva
    description: string;
}

export const PETS: Record<PetType, PetDefinition> = {
    gato: {
        id: 'gato',
        name: 'Lumi',
        stages: ['🐱', '🐈', '🐈‍⬛', '🦁', '😼'],
        description: 'Vibrante y llena de energía.'
    },
    perro: {
        id: 'perro',
        name: 'Zipo',
        stages: ['🐶', '🐕', '🦮', '🐺', '🐩'],
        description: 'Leal y eléctrico.'
    },
    dino: {
        id: 'dino',
        name: 'Grom',
        stages: ['🥚', '🦖', '🦕', '🐉', '🐲'],
        description: 'Fuerza salvaje y pura.'
    },
    axolote: {
        id: 'axolote',
        name: 'Axi',
        stages: ['💧', '🐟', '🦎', '🐉', '🌊'],
        description: 'Calma profunda como el océano.'
    },
    pajaro: {
        id: 'pajaro',
        name: 'Tui',
        stages: ['🐣', '🐥', '🦅', '🦉', '🔥'],
        description: 'Brillante y explosivo.'
    },
    zorro: {
        id: 'zorro',
        name: 'Koda',
        stages: ['🦊', '🐺', '🐕', '🐆', '🏵️'],
        description: 'Misterio en color púrpura.'
    },
    panda: {
        id: 'panda',
        name: 'Mochi',
        stages: ['🐼', '🐻', '🐨', '🥋', '🎍'],
        description: 'Estilo audaz y único.'
    },
    robot: {
        id: 'robot',
        name: 'Glitch',
        stages: ['🤖', '🦾', '🦿', '🚀', '🛸'],
        description: 'Futuro de alta tecnología.'
    }
};

export const BUILDING_STAGES = ['🌱', '⛺', '🏠', '🏘️', '🏢', '🏙️', '🏰', '👑'];
