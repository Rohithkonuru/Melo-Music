import { Router } from 'express';
import { searchGlobal, getSearchSuggestions } from '../controllers/searchController';

const router = Router();

router.get('/', searchGlobal);
router.get('/suggestions', getSearchSuggestions);

export default router;
