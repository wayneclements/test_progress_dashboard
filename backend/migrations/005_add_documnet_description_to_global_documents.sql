-- Add unique text column documnet_description to global_documents (only if neither documnet_description nor document_description exists)
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'global_documents' AND column_name IN ('documnet_description', 'document_description')
	) THEN
		EXECUTE 'ALTER TABLE global_documents ADD COLUMN documnet_description TEXT UNIQUE';
	END IF;
END $$;
