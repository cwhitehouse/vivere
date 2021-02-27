import * as Turbo from '@hotwired/turbo';
import Vivere from '../dist/vivere.es2017-esm.js';

import Accordion from './includes/examples/tabs/accordion.js';
import AccordionSection from './includes/examples/tabs/section.js';

import FancyCounter from './includes/examples/counters/fancy.js';

import ToDoItem from './includes/examples/to-do-list/item.js';
import ToDoList from './includes/examples/to-do-list/list.js';
import ToDoNewItem from './includes/examples/to-do-list/new-item.js';
import ToDoSearch from './includes/examples/to-do-list/search.js';

Vivere.register('Accordion', Accordion);
Vivere.register('AccordionSection', AccordionSection);
Vivere.register('FancyCounter', FancyCounter);
Vivere.register('ToDoItem', ToDoItem);
Vivere.register('ToDoList', ToDoList);
Vivere.register('ToDoNewItem', ToDoNewItem);
Vivere.register('ToDoSearch', ToDoSearch);
