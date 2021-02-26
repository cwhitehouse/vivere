import * as Turbo from '@hotwired/turbo';
import Vivere from '../dist/vivere.es2017-esm.js';

import Accordion from './includes/accordion/accordion.js';
import AccordionSection from './includes/accordion/section.js';
import Counter from './includes/counter.js';
import ToDoItem from './includes/to-do/item.js';
import ToDoList from './includes/to-do/list.js';
import ToDoNewItem from './includes/to-do/new-item.js';
import ToDoSearch from './includes/to-do/search.js';

Vivere.register('Accordion', Accordion);
Vivere.register('AccordionSection', AccordionSection);
Vivere.register('Counter', Counter);
Vivere.register('ToDoItem', ToDoItem);
Vivere.register('ToDoList', ToDoList);
Vivere.register('ToDoNewItem', ToDoNewItem);
Vivere.register('ToDoSearch', ToDoSearch);
