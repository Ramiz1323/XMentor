import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, name, type, image, keywords }) => {
  const siteTitle = 'XMentor';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const defaultDescription = 'XMentor is a gamified intelligence learning platform for master tactical education and MCQ assessments.';
  const defaultKeywords = 'XMentor, gamified learning, tactical education, MCQ assessments, student collaboration';

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name='description' content={description || defaultDescription} />
      <meta name='keywords' content={keywords || defaultKeywords} />
      <link rel="canonical" href={`https://xmentor.skramizraza.tech${window.location.pathname}`} />
      
      {/* Open Graph / Facebook tags */}
      <meta property="og:type" content={type || 'website'} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      {image && <meta property="og:image" content={image} />}
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content={name || 'XMentor'} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
};

export default SEO;
