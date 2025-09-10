import { Raleway, Montserrat, PT_Sans } from 'next/font/google';

export const raleway = Raleway({
  subsets: ['latin'],
  variable: '--font-raleway',
  display: 'swap',
});

export const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const ptSans = PT_Sans({
  subsets: ['latin'],
  variable: '--font-pt-sans',
  weight: ['400', '700'],
  display: 'swap',
});
