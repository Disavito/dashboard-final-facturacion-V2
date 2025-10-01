npm run build
> vite-shadcn@0.0.0 build
> tsc -b && vite build
src/components/invoicing/InvoicingCalendar.tsx:5:26 - error TS2307: Cannot find module '@tanstack/react-query' or its corresponding type declarations.
5 import { useQuery } from '@tanstack/react-query';
~~~~~~~~~~~~~~~~~~~~~~~
src/pages/invoicing/BoletasPage.tsx:2:10 - error TS6133: 'Card' is declared but its value is never read.
2 import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
~~~~
src/pages/invoicing/BoletasPage.tsx:2:56 - error TS6133: 'CardContent' is declared but its value is never read.
2 import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
~~~~~~~~~~~
src/pages/invoicing/InvoicingLayout.tsx:2:39 - error TS6133: 'TabsContent' is declared but its value is never read.
2 import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
~~~~~~~~~~~
Found 4 errors.
\
