-- Careers and job applications are no longer part of the product.
DROP TABLE IF EXISTS career_applications CASCADE;
DROP TABLE IF EXISTS careers CASCADE;

DELETE FROM storage.objects
WHERE bucket_id = 'career-cvs';

DELETE FROM storage.buckets
WHERE id = 'career-cvs';
