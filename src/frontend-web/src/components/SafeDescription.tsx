import DOMPurify from 'dompurify';

interface Props {
    deskripcija: string;
}

const SafeDescription: React.FC<Props> = ({ deskripcija }) => {
    const cleanHTML = DOMPurify.sanitize(deskripcija);

    return (
        <div
            style={{
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
                width: '100%',
                lineHeight: '1.5',
            }}
            dangerouslySetInnerHTML={{ __html: cleanHTML }}
        />
    );
};

export default SafeDescription;
