USE HealthcareChatbotDB;
GO

-- Add UserId to Doctors table to link with User accounts
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Doctors') AND name = 'UserId')
BEGIN
    ALTER TABLE Doctors ADD UserId INT NULL;
    PRINT 'Added UserId column to Doctors table.';
END
GO

-- Add Foreign Key constraint
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Doctors_Users')
BEGIN
    ALTER TABLE Doctors ADD CONSTRAINT FK_Doctors_Users 
    FOREIGN KEY (UserId) REFERENCES Users(Id);
    PRINT 'Added Foreign Key constraint FK_Doctors_Users.';
END
GO
