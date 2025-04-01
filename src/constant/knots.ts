export interface Knot {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export const knots: Knot[] = [
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