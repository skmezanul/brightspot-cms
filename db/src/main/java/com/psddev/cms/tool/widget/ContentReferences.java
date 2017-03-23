package com.psddev.cms.tool.widget;

import com.google.common.collect.ImmutableMap;
import com.psddev.cms.db.Content;
import com.psddev.cms.db.Directory;
import com.psddev.cms.db.Draft;
import com.psddev.cms.db.Localization;
import com.psddev.cms.tool.ContentEditSection;
import com.psddev.cms.tool.ContentEditWidget;
import com.psddev.cms.tool.Search;
import com.psddev.cms.tool.ToolPageContext;
import com.psddev.dari.db.Query;
import com.psddev.dari.db.State;
import com.psddev.dari.util.PaginatedResult;

import java.io.IOException;
import java.util.UUID;

public class ContentReferences extends ContentEditWidget {

    @Override
    public ContentEditSection getSection(ToolPageContext page, Object content) {
        return ContentEditSection.RIGHT;
    }

    @Override
    public String getHeading(ToolPageContext page, Object content) {
        return Localization.currentUserText(ContentReferences.class, "title");
    }

    @Override
    public void display(ToolPageContext page, Object content, ContentEditSection section) throws IOException {
        UUID contentId = State.getInstance(content).getId();
        Query<Object> query = Query
                .fromGroup(Content.SEARCHABLE_GROUP)
                .and("* matches ?", contentId)
                .and("_type != ?", Draft.class)
                .and("_id != ?", contentId)
                .and("cms.content.updateDate != missing")
                .sortDescending("cms.content.updateDate");

        PaginatedResult<Object> result = query.select(0L, 10);

        if (result.getItems().isEmpty()) {
            return;
        }

        if (result.hasNext()) {
            page.writeStart("p");
                page.writeStart("a",
                        "class", "icon icon-action-search",
                        "target", "_top",
                        "href", page.cmsUrl("/searchAdvancedFull",
                                Search.ADVANCED_QUERY_PARAMETER, query.getPredicate().toString()));
                    page.writeHtml(page.localize(
                            ContentReferences.class,
                            ImmutableMap.of("count", result.getCount()),
                            "action.viewAll"));
                page.writeEnd();
            page.writeEnd();

            page.writeStart("h2");
                page.writeHtml(page.localize(
                        ContentReferences.class,
                        ImmutableMap.of("count", result.getItems().size()),
                        "subtitle.mostRecent"));
            page.writeEnd();
        }

        page.writeStart("ul", "class", "links pageThumbnails");
            for (Object item : result.getItems()) {
                page.writeStart("li",
                        "data-preview-url", State.getInstance(item).as(Directory.ObjectModification.class).getPermalink());
                    page.writeStart("a",
                            "href", page.objectUrl("/content/edit.jsp", item),
                            "target", "_top");
                        page.writeTypeObjectLabel(item);
                    page.writeEnd();
                page.writeEnd();
            }
        page.writeEnd();
    }
}
