// The CSS of Bootstrap, of the core and of the skin, then the skin: its import defines <table-bro> and registers the
// skin bs, and useBootstrap() gives it the Dropdown and the Tooltip of Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import '@table-bro/core/dist/table-bro.min.css';
import '@table-bro/bootstrap/dist/table-bro.bootstrap.min.css';
import {useBootstrap}      from '@table-bro/bootstrap';
import {Dropdown, Tooltip} from 'bootstrap';

import './sample-page.css';

useBootstrap({Dropdown, Tooltip});
