-- Add unique text column documnet_id to global_documents (only if neither documnet_id nor document_id exists)
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'global_documents' AND column_name IN ('documnet_id', 'document_id')
	) THEN
		EXECUTE 'ALTER TABLE global_documents ADD COLUMN documnet_id TEXT UNIQUE';
	END IF;
END $$;
