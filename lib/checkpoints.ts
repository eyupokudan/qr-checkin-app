export interface Checkpoint {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const checkpoints: Checkpoint[] = [
  { id: "qr-k4m7x", name: "1. Konum", emoji: "⚛️", description: "1. İstasyon" },
  { id: "qr-b9n2p", name: "2. Konum", emoji: "🧪", description: "2. İstasyon" },
  { id: "qr-f6t3w", name: "3. Konum", emoji: "🔬", description: "3. İstasyon" },
  { id: "qr-j8s5r", name: "4. Konum", emoji: "📐", description: "4. İstasyon" },
  { id: "qr-c1v4z", name: "5. Konum", emoji: "🔭", description: "5. İstasyon" },
  { id: "qr-h3d9q", name: "6. Konum", emoji: "🤖", description: "6. İstasyon" },
  { id: "qr-g7l2y", name: "7. Konum", emoji: "🌿", description: "7. İstasyon" },
];

export const TOTAL = checkpoints.length;
