import Vivere from './vivere/vivere.js';

import Accordion from './components/accordion.js';
import AccordionSection from './components/accordion/section.js';
import Example from './components/example.js';

Vivere.register('Accordion', Accordion);
Vivere.register('AccordionSection', AccordionSection);
Vivere.register('Example', Example);

Vivere.setup();
