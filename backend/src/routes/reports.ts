import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createReportSchema, updateReportStatusSchema } from '../validators/report';

const router = Router();

router.use(authenticate);

router.post('/', validate(createReportSchema), ReportController.createReport);
router.get('/', ReportController.getReports);
router.put('/:id/status', validate(updateReportStatusSchema), ReportController.updateStatus);

export default router;
