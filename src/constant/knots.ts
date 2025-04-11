export interface Knot {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export const knots: Knot[] = [
  {
    id: 'half-knot',
    name: 'Half Knot',
    description: 'A simple binding knot that is the first step of the Square (Reef) Knot. It is a symmetrical knot that can bind when tied correctly.',
    imageUrl: '/images/knots/halfknotR5.jpg',
  },
  {
    id: 'square-knot',
    name: 'Square Knot',
    description: 'A basic binding knot that is easy to tie and untie.',
    imageUrl: '/images/knots/square-knot.jpg',
  },
  {
    id: 'bowline',
    name: 'Bowline',
    description: 'A secure loop knot that won\'t slip or bind.',
    imageUrl: '/images/knots/bowline.jpg',
  },
  {
    id: 'figure-eight',
    name: 'Figure Eight',
    description: 'A strong knot that is easy to visually verify.',
    imageUrl: '/images/knots/figure-eight.jpg',
  },
  {
    id: 'clove-hitch',
    name: 'Clove Hitch',
    description: 'A versatile knot for attaching rope to a post or pole.',
    imageUrl: '/images/knots/clove-hitch.jpg',
  },
]; 