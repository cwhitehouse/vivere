import Vivere from './vivere/vivere.js';

import Accordion from './examples/components/accordion.js';
import AccordionSection from './examples/components/accordion/section.js';
import Example from './examples/components/example.js';
import InlineForm from './examples/components/inline-form.js';
import ToDoItem from './examples/components/to-do/item.js';
import ToDoList from './examples/components/to-do/list.js';
import ToDoNewItem from './examples/components/to-do/new-item.js';

Vivere.register('Accordion', Accordion);
Vivere.register('AccordionSection', AccordionSection);
Vivere.register('Example', Example);
Vivere.register('InlineForm', InlineForm);
Vivere.register('ToDoItem', ToDoItem);
Vivere.register('ToDoList', ToDoList);
Vivere.register('ToDoNewItem', ToDoNewItem);

Vivere.setup();
