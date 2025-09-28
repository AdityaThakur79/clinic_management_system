import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Box } from '@chakra-ui/react';

const RichTextEditor = ({ value, onChange, placeholder = "Write your content here..." }) => {
  return (
    <Box>
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        preview="edit"
        hideToolbar={false}
        visibleDragBar={false}
        height={400}
        data-color-mode="light"
        textareaProps={{
          placeholder: placeholder,
          style: {
            fontSize: 14,
            fontFamily: 'inherit',
          },
        }}
      />
    </Box>
  );
};

export default RichTextEditor;
