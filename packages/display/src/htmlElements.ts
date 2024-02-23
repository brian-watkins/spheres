import { View, ConfigurableElement, SpecialElements, SpecialElementBuilder, Stateful } from "./view.js";
import { SpecialAttributes } from "./viewConfig.js";
import { SVGElements, SvgElementAttributes } from "./svgElements.js";

export interface GlobalHTMLAttributes<Context> {
    accesskey(value: string | Stateful<string, Context>): this;
    autocapitalize(value: string | Stateful<string, Context>): this;
    autofocus(value: boolean | Stateful<boolean, Context>): this;
    class(value: string | Stateful<string, Context>): this;
    contenteditable(value: string | Stateful<string, Context>): this;
    dir(value: string | Stateful<string, Context>): this;
    draggable(value: string | Stateful<string, Context>): this;
    enterkeyhint(value: string | Stateful<string, Context>): this;
    hidden(value: string | Stateful<string, Context>): this;
    id(value: string | Stateful<string, Context>): this;
    inert(value: boolean | Stateful<boolean, Context>): this;
    inputmode(value: string | Stateful<string, Context>): this;
    is(value: string | Stateful<string, Context>): this;
    itemid(value: string | Stateful<string, Context>): this;
    itemprop(value: string | Stateful<string, Context>): this;
    itemref(value: string | Stateful<string, Context>): this;
    itemscope(value: boolean | Stateful<boolean, Context>): this;
    itemtype(value: string | Stateful<string, Context>): this;
    lang(value: string | Stateful<string, Context>): this;
    nonce(value: string | Stateful<string, Context>): this;
    popover(value: string | Stateful<string, Context>): this;
    slot(value: string | Stateful<string, Context>): this;
    spellcheck(value: string | Stateful<string, Context>): this;
    style(value: string | Stateful<string, Context>): this;
    tabindex(value: string | Stateful<string, Context>): this;
    title(value: string | Stateful<string, Context>): this;
    translate(value: string | Stateful<string, Context>): this;
    role(value: string | Stateful<string, Context>): this;
}

export interface HTMLBuilder<Context> extends SpecialElementBuilder<Context> {
    a(builder?: (element: ConfigurableElement<AElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    abbr(builder?: (element: ConfigurableElement<AbbrElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    address(builder?: (element: ConfigurableElement<AddressElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    area(builder?: (element: ConfigurableElement<AreaElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    article(builder?: (element: ConfigurableElement<ArticleElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    aside(builder?: (element: ConfigurableElement<AsideElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    audio(builder?: (element: ConfigurableElement<AudioElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    b(builder?: (element: ConfigurableElement<BElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    base(builder?: (element: ConfigurableElement<BaseElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    bdi(builder?: (element: ConfigurableElement<BdiElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    bdo(builder?: (element: ConfigurableElement<BdoElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    blockquote(builder?: (element: ConfigurableElement<BlockquoteElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    body(builder?: (element: ConfigurableElement<BodyElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    br(builder?: (element: ConfigurableElement<BrElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    button(builder?: (element: ConfigurableElement<ButtonElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    canvas(builder?: (element: ConfigurableElement<CanvasElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    caption(builder?: (element: ConfigurableElement<CaptionElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    cite(builder?: (element: ConfigurableElement<CiteElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    code(builder?: (element: ConfigurableElement<CodeElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    col(builder?: (element: ConfigurableElement<ColElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    colgroup(builder?: (element: ConfigurableElement<ColgroupElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    data(builder?: (element: ConfigurableElement<DataElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    datalist(builder?: (element: ConfigurableElement<DatalistElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    dd(builder?: (element: ConfigurableElement<DdElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    del(builder?: (element: ConfigurableElement<DelElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    details(builder?: (element: ConfigurableElement<DetailsElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    dfn(builder?: (element: ConfigurableElement<DfnElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    dialog(builder?: (element: ConfigurableElement<DialogElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    div(builder?: (element: ConfigurableElement<DivElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    dl(builder?: (element: ConfigurableElement<DlElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    dt(builder?: (element: ConfigurableElement<DtElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    em(builder?: (element: ConfigurableElement<EmElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    embed(builder?: (element: ConfigurableElement<EmbedElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    fieldset(builder?: (element: ConfigurableElement<FieldsetElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    figcaption(builder?: (element: ConfigurableElement<FigcaptionElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    figure(builder?: (element: ConfigurableElement<FigureElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    footer(builder?: (element: ConfigurableElement<FooterElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    form(builder?: (element: ConfigurableElement<FormElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    h1(builder?: (element: ConfigurableElement<H1ElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    h2(builder?: (element: ConfigurableElement<H2ElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    h3(builder?: (element: ConfigurableElement<H3ElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    h4(builder?: (element: ConfigurableElement<H4ElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    h5(builder?: (element: ConfigurableElement<H5ElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    h6(builder?: (element: ConfigurableElement<H6ElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    head(builder?: (element: ConfigurableElement<HeadElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    header(builder?: (element: ConfigurableElement<HeaderElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    hgroup(builder?: (element: ConfigurableElement<HgroupElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    hr(builder?: (element: ConfigurableElement<HrElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    html(builder?: (element: ConfigurableElement<HtmlElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    i(builder?: (element: ConfigurableElement<IElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    iframe(builder?: (element: ConfigurableElement<IframeElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    img(builder?: (element: ConfigurableElement<ImgElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    input(builder?: (element: ConfigurableElement<InputElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    ins(builder?: (element: ConfigurableElement<InsElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    kbd(builder?: (element: ConfigurableElement<KbdElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    label(builder?: (element: ConfigurableElement<LabelElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    legend(builder?: (element: ConfigurableElement<LegendElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    li(builder?: (element: ConfigurableElement<LiElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    link(builder?: (element: ConfigurableElement<LinkElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    main(builder?: (element: ConfigurableElement<MainElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    map(builder?: (element: ConfigurableElement<MapElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    mark(builder?: (element: ConfigurableElement<MarkElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    math(builder?: (element: ConfigurableElement<MathElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    menu(builder?: (element: ConfigurableElement<MenuElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    menuitem(builder?: (element: ConfigurableElement<MenuitemElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    meta(builder?: (element: ConfigurableElement<MetaElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    meter(builder?: (element: ConfigurableElement<MeterElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    nav(builder?: (element: ConfigurableElement<NavElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    noscript(builder?: (element: ConfigurableElement<NoscriptElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    object(builder?: (element: ConfigurableElement<ObjectElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    ol(builder?: (element: ConfigurableElement<OlElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    optgroup(builder?: (element: ConfigurableElement<OptgroupElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    option(builder?: (element: ConfigurableElement<OptionElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    output(builder?: (element: ConfigurableElement<OutputElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    p(builder?: (element: ConfigurableElement<PElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    param(builder?: (element: ConfigurableElement<ParamElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    picture(builder?: (element: ConfigurableElement<PictureElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    pre(builder?: (element: ConfigurableElement<PreElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    progress(builder?: (element: ConfigurableElement<ProgressElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    q(builder?: (element: ConfigurableElement<QElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    rb(builder?: (element: ConfigurableElement<RbElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    rp(builder?: (element: ConfigurableElement<RpElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    rt(builder?: (element: ConfigurableElement<RtElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    rtc(builder?: (element: ConfigurableElement<RtcElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    ruby(builder?: (element: ConfigurableElement<RubyElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    s(builder?: (element: ConfigurableElement<SElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    samp(builder?: (element: ConfigurableElement<SampElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    script(builder?: (element: ConfigurableElement<ScriptElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    search(builder?: (element: ConfigurableElement<SearchElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    section(builder?: (element: ConfigurableElement<SectionElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    select(builder?: (element: ConfigurableElement<SelectElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    slot(builder?: (element: ConfigurableElement<SlotElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    small(builder?: (element: ConfigurableElement<SmallElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    source(builder?: (element: ConfigurableElement<SourceElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    span(builder?: (element: ConfigurableElement<SpanElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    strong(builder?: (element: ConfigurableElement<StrongElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    style(builder?: (element: ConfigurableElement<StyleElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    sub(builder?: (element: ConfigurableElement<SubElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    summary(builder?: (element: ConfigurableElement<SummaryElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    sup(builder?: (element: ConfigurableElement<SupElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    svg(builder?: (element: ConfigurableElement<SvgElementAttributes<Context>, SVGElements<Context>, Context>) => void): View;
    table(builder?: (element: ConfigurableElement<TableElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    tbody(builder?: (element: ConfigurableElement<TbodyElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    td(builder?: (element: ConfigurableElement<TdElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    template(builder?: (element: ConfigurableElement<TemplateElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    textarea(builder?: (element: ConfigurableElement<TextareaElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    tfoot(builder?: (element: ConfigurableElement<TfootElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    th(builder?: (element: ConfigurableElement<ThElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    thead(builder?: (element: ConfigurableElement<TheadElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    time(builder?: (element: ConfigurableElement<TimeElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    title(builder?: (element: ConfigurableElement<TitleElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    tr(builder?: (element: ConfigurableElement<TrElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    track(builder?: (element: ConfigurableElement<TrackElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    u(builder?: (element: ConfigurableElement<UElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    ul(builder?: (element: ConfigurableElement<UlElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    var(builder?: (element: ConfigurableElement<VarElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    video(builder?: (element: ConfigurableElement<VideoElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
    wbr(builder?: (element: ConfigurableElement<WbrElementAttributes<Context>, HTMLElements<Context>, Context>) => void): View;
}

export interface HTMLElements<Context> extends SpecialElements<Context> {
    a(builder?: (element: ConfigurableElement<AElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    abbr(builder?: (element: ConfigurableElement<AbbrElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    address(builder?: (element: ConfigurableElement<AddressElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    area(builder?: (element: ConfigurableElement<AreaElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    article(builder?: (element: ConfigurableElement<ArticleElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    aside(builder?: (element: ConfigurableElement<AsideElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    audio(builder?: (element: ConfigurableElement<AudioElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    b(builder?: (element: ConfigurableElement<BElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    base(builder?: (element: ConfigurableElement<BaseElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    bdi(builder?: (element: ConfigurableElement<BdiElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    bdo(builder?: (element: ConfigurableElement<BdoElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    blockquote(builder?: (element: ConfigurableElement<BlockquoteElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    body(builder?: (element: ConfigurableElement<BodyElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    br(builder?: (element: ConfigurableElement<BrElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    button(builder?: (element: ConfigurableElement<ButtonElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    canvas(builder?: (element: ConfigurableElement<CanvasElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    caption(builder?: (element: ConfigurableElement<CaptionElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    cite(builder?: (element: ConfigurableElement<CiteElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    code(builder?: (element: ConfigurableElement<CodeElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    col(builder?: (element: ConfigurableElement<ColElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    colgroup(builder?: (element: ConfigurableElement<ColgroupElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    data(builder?: (element: ConfigurableElement<DataElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    datalist(builder?: (element: ConfigurableElement<DatalistElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    dd(builder?: (element: ConfigurableElement<DdElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    del(builder?: (element: ConfigurableElement<DelElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    details(builder?: (element: ConfigurableElement<DetailsElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    dfn(builder?: (element: ConfigurableElement<DfnElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    dialog(builder?: (element: ConfigurableElement<DialogElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    div(builder?: (element: ConfigurableElement<DivElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    dl(builder?: (element: ConfigurableElement<DlElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    dt(builder?: (element: ConfigurableElement<DtElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    em(builder?: (element: ConfigurableElement<EmElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    embed(builder?: (element: ConfigurableElement<EmbedElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    fieldset(builder?: (element: ConfigurableElement<FieldsetElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    figcaption(builder?: (element: ConfigurableElement<FigcaptionElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    figure(builder?: (element: ConfigurableElement<FigureElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    footer(builder?: (element: ConfigurableElement<FooterElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    form(builder?: (element: ConfigurableElement<FormElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    h1(builder?: (element: ConfigurableElement<H1ElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    h2(builder?: (element: ConfigurableElement<H2ElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    h3(builder?: (element: ConfigurableElement<H3ElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    h4(builder?: (element: ConfigurableElement<H4ElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    h5(builder?: (element: ConfigurableElement<H5ElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    h6(builder?: (element: ConfigurableElement<H6ElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    head(builder?: (element: ConfigurableElement<HeadElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    header(builder?: (element: ConfigurableElement<HeaderElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    hgroup(builder?: (element: ConfigurableElement<HgroupElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    hr(builder?: (element: ConfigurableElement<HrElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    html(builder?: (element: ConfigurableElement<HtmlElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    i(builder?: (element: ConfigurableElement<IElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    iframe(builder?: (element: ConfigurableElement<IframeElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    img(builder?: (element: ConfigurableElement<ImgElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    input(builder?: (element: ConfigurableElement<InputElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    ins(builder?: (element: ConfigurableElement<InsElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    kbd(builder?: (element: ConfigurableElement<KbdElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    label(builder?: (element: ConfigurableElement<LabelElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    legend(builder?: (element: ConfigurableElement<LegendElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    li(builder?: (element: ConfigurableElement<LiElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    link(builder?: (element: ConfigurableElement<LinkElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    main(builder?: (element: ConfigurableElement<MainElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    map(builder?: (element: ConfigurableElement<MapElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    mark(builder?: (element: ConfigurableElement<MarkElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    math(builder?: (element: ConfigurableElement<MathElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    menu(builder?: (element: ConfigurableElement<MenuElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    menuitem(builder?: (element: ConfigurableElement<MenuitemElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    meta(builder?: (element: ConfigurableElement<MetaElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    meter(builder?: (element: ConfigurableElement<MeterElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    nav(builder?: (element: ConfigurableElement<NavElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    noscript(builder?: (element: ConfigurableElement<NoscriptElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    object(builder?: (element: ConfigurableElement<ObjectElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    ol(builder?: (element: ConfigurableElement<OlElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    optgroup(builder?: (element: ConfigurableElement<OptgroupElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    option(builder?: (element: ConfigurableElement<OptionElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    output(builder?: (element: ConfigurableElement<OutputElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    p(builder?: (element: ConfigurableElement<PElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    param(builder?: (element: ConfigurableElement<ParamElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    picture(builder?: (element: ConfigurableElement<PictureElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    pre(builder?: (element: ConfigurableElement<PreElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    progress(builder?: (element: ConfigurableElement<ProgressElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    q(builder?: (element: ConfigurableElement<QElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    rb(builder?: (element: ConfigurableElement<RbElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    rp(builder?: (element: ConfigurableElement<RpElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    rt(builder?: (element: ConfigurableElement<RtElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    rtc(builder?: (element: ConfigurableElement<RtcElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    ruby(builder?: (element: ConfigurableElement<RubyElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    s(builder?: (element: ConfigurableElement<SElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    samp(builder?: (element: ConfigurableElement<SampElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    script(builder?: (element: ConfigurableElement<ScriptElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    search(builder?: (element: ConfigurableElement<SearchElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    section(builder?: (element: ConfigurableElement<SectionElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    select(builder?: (element: ConfigurableElement<SelectElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    slot(builder?: (element: ConfigurableElement<SlotElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    small(builder?: (element: ConfigurableElement<SmallElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    source(builder?: (element: ConfigurableElement<SourceElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    span(builder?: (element: ConfigurableElement<SpanElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    strong(builder?: (element: ConfigurableElement<StrongElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    style(builder?: (element: ConfigurableElement<StyleElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    sub(builder?: (element: ConfigurableElement<SubElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    summary(builder?: (element: ConfigurableElement<SummaryElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    sup(builder?: (element: ConfigurableElement<SupElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    svg(builder?: (element: ConfigurableElement<SvgElementAttributes<Context>, SVGElements<Context>, Context>) => void): this;
    table(builder?: (element: ConfigurableElement<TableElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    tbody(builder?: (element: ConfigurableElement<TbodyElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    td(builder?: (element: ConfigurableElement<TdElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    template(builder?: (element: ConfigurableElement<TemplateElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    textarea(builder?: (element: ConfigurableElement<TextareaElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    tfoot(builder?: (element: ConfigurableElement<TfootElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    th(builder?: (element: ConfigurableElement<ThElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    thead(builder?: (element: ConfigurableElement<TheadElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    time(builder?: (element: ConfigurableElement<TimeElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    title(builder?: (element: ConfigurableElement<TitleElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    tr(builder?: (element: ConfigurableElement<TrElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    track(builder?: (element: ConfigurableElement<TrackElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    u(builder?: (element: ConfigurableElement<UElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    ul(builder?: (element: ConfigurableElement<UlElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    var(builder?: (element: ConfigurableElement<VarElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    video(builder?: (element: ConfigurableElement<VideoElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
    wbr(builder?: (element: ConfigurableElement<WbrElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this;
}

export interface AElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    charset(value: string | Stateful<string, Context>): AElementAttributes<Context>;
    coords(value: string | Stateful<string, Context>): AElementAttributes<Context>;
    download(value: string | Stateful<string, Context>): AElementAttributes<Context>;
    href(value: string | Stateful<string, Context>): AElementAttributes<Context>;
    hreflang(value: string | Stateful<string, Context>): AElementAttributes<Context>;
    name(value: string | Stateful<string, Context>): AElementAttributes<Context>;
    ping(value: string | Stateful<string, Context>): AElementAttributes<Context>;
    referrerpolicy(value: string | Stateful<string, Context>): AElementAttributes<Context>;
    rel(value: string | Stateful<string, Context>): AElementAttributes<Context>;
    rev(value: string | Stateful<string, Context>): AElementAttributes<Context>;
    shape(value: string | Stateful<string, Context>): AElementAttributes<Context>;
    target(value: string | Stateful<string, Context>): AElementAttributes<Context>;
    type(value: string | Stateful<string, Context>): AElementAttributes<Context>;
}

export interface AbbrElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface AddressElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface AreaElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    alt(value: string | Stateful<string, Context>): AreaElementAttributes<Context>;
    coords(value: string | Stateful<string, Context>): AreaElementAttributes<Context>;
    download(value: string | Stateful<string, Context>): AreaElementAttributes<Context>;
    href(value: string | Stateful<string, Context>): AreaElementAttributes<Context>;
    hreflang(value: string | Stateful<string, Context>): AreaElementAttributes<Context>;
    nohref(value: string | Stateful<string, Context>): AreaElementAttributes<Context>;
    ping(value: string | Stateful<string, Context>): AreaElementAttributes<Context>;
    referrerpolicy(value: string | Stateful<string, Context>): AreaElementAttributes<Context>;
    rel(value: string | Stateful<string, Context>): AreaElementAttributes<Context>;
    shape(value: string | Stateful<string, Context>): AreaElementAttributes<Context>;
    target(value: string | Stateful<string, Context>): AreaElementAttributes<Context>;
    type(value: string | Stateful<string, Context>): AreaElementAttributes<Context>;
}

export interface ArticleElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface AsideElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface AudioElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    autoplay(value: boolean | Stateful<boolean, Context>): AudioElementAttributes<Context>;
    controls(value: boolean | Stateful<boolean, Context>): AudioElementAttributes<Context>;
    crossorigin(value: string | Stateful<string, Context>): AudioElementAttributes<Context>;
    loop(value: boolean | Stateful<boolean, Context>): AudioElementAttributes<Context>;
    muted(value: boolean | Stateful<boolean, Context>): AudioElementAttributes<Context>;
    preload(value: string | Stateful<string, Context>): AudioElementAttributes<Context>;
    src(value: string | Stateful<string, Context>): AudioElementAttributes<Context>;
}

export interface BElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface BaseElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    href(value: string | Stateful<string, Context>): BaseElementAttributes<Context>;
    target(value: string | Stateful<string, Context>): BaseElementAttributes<Context>;
}

export interface BdiElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface BdoElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface BlockquoteElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    cite(value: string | Stateful<string, Context>): BlockquoteElementAttributes<Context>;
}

export interface BodyElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    alink(value: string | Stateful<string, Context>): BodyElementAttributes<Context>;
    background(value: string | Stateful<string, Context>): BodyElementAttributes<Context>;
    bgcolor(value: string | Stateful<string, Context>): BodyElementAttributes<Context>;
    link(value: string | Stateful<string, Context>): BodyElementAttributes<Context>;
    text(value: string | Stateful<string, Context>): BodyElementAttributes<Context>;
    vlink(value: string | Stateful<string, Context>): BodyElementAttributes<Context>;
}

export interface BrElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    clear(value: string | Stateful<string, Context>): BrElementAttributes<Context>;
}

export interface ButtonElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    disabled(value: boolean | Stateful<boolean, Context>): ButtonElementAttributes<Context>;
    form(value: string | Stateful<string, Context>): ButtonElementAttributes<Context>;
    formaction(value: string | Stateful<string, Context>): ButtonElementAttributes<Context>;
    formenctype(value: string | Stateful<string, Context>): ButtonElementAttributes<Context>;
    formmethod(value: string | Stateful<string, Context>): ButtonElementAttributes<Context>;
    formnovalidate(value: boolean | Stateful<boolean, Context>): ButtonElementAttributes<Context>;
    formtarget(value: string | Stateful<string, Context>): ButtonElementAttributes<Context>;
    name(value: string | Stateful<string, Context>): ButtonElementAttributes<Context>;
    popovertarget(value: string | Stateful<string, Context>): ButtonElementAttributes<Context>;
    popovertargetaction(value: string | Stateful<string, Context>): ButtonElementAttributes<Context>;
    type(value: string | Stateful<string, Context>): ButtonElementAttributes<Context>;
    value(value: string | Stateful<string, Context>): ButtonElementAttributes<Context>;
}

export interface CanvasElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    height(value: string | Stateful<string, Context>): CanvasElementAttributes<Context>;
    width(value: string | Stateful<string, Context>): CanvasElementAttributes<Context>;
}

export interface CaptionElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    align(value: string | Stateful<string, Context>): CaptionElementAttributes<Context>;
}

export interface CiteElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface CodeElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface ColElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    align(value: string | Stateful<string, Context>): ColElementAttributes<Context>;
    char(value: string | Stateful<string, Context>): ColElementAttributes<Context>;
    charoff(value: string | Stateful<string, Context>): ColElementAttributes<Context>;
    span(value: string | Stateful<string, Context>): ColElementAttributes<Context>;
    valign(value: string | Stateful<string, Context>): ColElementAttributes<Context>;
    width(value: string | Stateful<string, Context>): ColElementAttributes<Context>;
}

export interface ColgroupElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    align(value: string | Stateful<string, Context>): ColgroupElementAttributes<Context>;
    char(value: string | Stateful<string, Context>): ColgroupElementAttributes<Context>;
    charoff(value: string | Stateful<string, Context>): ColgroupElementAttributes<Context>;
    span(value: string | Stateful<string, Context>): ColgroupElementAttributes<Context>;
    valign(value: string | Stateful<string, Context>): ColgroupElementAttributes<Context>;
    width(value: string | Stateful<string, Context>): ColgroupElementAttributes<Context>;
}

export interface DataElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    value(value: string | Stateful<string, Context>): DataElementAttributes<Context>;
}

export interface DatalistElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface DdElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface DelElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    cite(value: string | Stateful<string, Context>): DelElementAttributes<Context>;
    datetime(value: string | Stateful<string, Context>): DelElementAttributes<Context>;
}

export interface DetailsElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    open(value: boolean | Stateful<boolean, Context>): DetailsElementAttributes<Context>;
}

export interface DfnElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface DialogElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    open(value: boolean | Stateful<boolean, Context>): DialogElementAttributes<Context>;
}

export interface DivElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    align(value: string | Stateful<string, Context>): DivElementAttributes<Context>;
}

export interface DlElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    compact(value: string | Stateful<string, Context>): DlElementAttributes<Context>;
}

export interface DtElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface EmElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface EmbedElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    height(value: string | Stateful<string, Context>): EmbedElementAttributes<Context>;
    src(value: string | Stateful<string, Context>): EmbedElementAttributes<Context>;
    type(value: string | Stateful<string, Context>): EmbedElementAttributes<Context>;
    width(value: string | Stateful<string, Context>): EmbedElementAttributes<Context>;
}

export interface FieldsetElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    disabled(value: boolean | Stateful<boolean, Context>): FieldsetElementAttributes<Context>;
    form(value: string | Stateful<string, Context>): FieldsetElementAttributes<Context>;
    name(value: string | Stateful<string, Context>): FieldsetElementAttributes<Context>;
}

export interface FigcaptionElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface FigureElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface FooterElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface FormElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    accept(value: string | Stateful<string, Context>): FormElementAttributes<Context>;
    acceptCharset(value: string | Stateful<string, Context>): FormElementAttributes<Context>;
    action(value: string | Stateful<string, Context>): FormElementAttributes<Context>;
    autocomplete(value: string | Stateful<string, Context>): FormElementAttributes<Context>;
    enctype(value: string | Stateful<string, Context>): FormElementAttributes<Context>;
    method(value: string | Stateful<string, Context>): FormElementAttributes<Context>;
    name(value: string | Stateful<string, Context>): FormElementAttributes<Context>;
    novalidate(value: boolean | Stateful<boolean, Context>): FormElementAttributes<Context>;
    target(value: string | Stateful<string, Context>): FormElementAttributes<Context>;
}

export interface H1ElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    align(value: string | Stateful<string, Context>): H1ElementAttributes<Context>;
}

export interface H2ElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    align(value: string | Stateful<string, Context>): H2ElementAttributes<Context>;
}

export interface H3ElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    align(value: string | Stateful<string, Context>): H3ElementAttributes<Context>;
}

export interface H4ElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    align(value: string | Stateful<string, Context>): H4ElementAttributes<Context>;
}

export interface H5ElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    align(value: string | Stateful<string, Context>): H5ElementAttributes<Context>;
}

export interface H6ElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    align(value: string | Stateful<string, Context>): H6ElementAttributes<Context>;
}

export interface HeadElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    profile(value: string | Stateful<string, Context>): HeadElementAttributes<Context>;
}

export interface HeaderElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface HgroupElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface HrElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    align(value: string | Stateful<string, Context>): HrElementAttributes<Context>;
    noshade(value: string | Stateful<string, Context>): HrElementAttributes<Context>;
    size(value: string | Stateful<string, Context>): HrElementAttributes<Context>;
    width(value: string | Stateful<string, Context>): HrElementAttributes<Context>;
}

export interface HtmlElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    manifest(value: string | Stateful<string, Context>): HtmlElementAttributes<Context>;
    version(value: string | Stateful<string, Context>): HtmlElementAttributes<Context>;
}

export interface IElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface IframeElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    align(value: string | Stateful<string, Context>): IframeElementAttributes<Context>;
    allow(value: string | Stateful<string, Context>): IframeElementAttributes<Context>;
    allowfullscreen(value: boolean | Stateful<boolean, Context>): IframeElementAttributes<Context>;
    allowpaymentrequest(value: string | Stateful<string, Context>): IframeElementAttributes<Context>;
    allowusermedia(value: string | Stateful<string, Context>): IframeElementAttributes<Context>;
    frameborder(value: string | Stateful<string, Context>): IframeElementAttributes<Context>;
    height(value: string | Stateful<string, Context>): IframeElementAttributes<Context>;
    loading(value: string | Stateful<string, Context>): IframeElementAttributes<Context>;
    longdesc(value: string | Stateful<string, Context>): IframeElementAttributes<Context>;
    marginheight(value: string | Stateful<string, Context>): IframeElementAttributes<Context>;
    marginwidth(value: string | Stateful<string, Context>): IframeElementAttributes<Context>;
    name(value: string | Stateful<string, Context>): IframeElementAttributes<Context>;
    referrerpolicy(value: string | Stateful<string, Context>): IframeElementAttributes<Context>;
    sandbox(value: string | Stateful<string, Context>): IframeElementAttributes<Context>;
    scrolling(value: string | Stateful<string, Context>): IframeElementAttributes<Context>;
    src(value: string | Stateful<string, Context>): IframeElementAttributes<Context>;
    srcdoc(value: string | Stateful<string, Context>): IframeElementAttributes<Context>;
    width(value: string | Stateful<string, Context>): IframeElementAttributes<Context>;
}

export interface ImgElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    align(value: string | Stateful<string, Context>): ImgElementAttributes<Context>;
    alt(value: string | Stateful<string, Context>): ImgElementAttributes<Context>;
    border(value: string | Stateful<string, Context>): ImgElementAttributes<Context>;
    crossorigin(value: string | Stateful<string, Context>): ImgElementAttributes<Context>;
    decoding(value: string | Stateful<string, Context>): ImgElementAttributes<Context>;
    fetchpriority(value: string | Stateful<string, Context>): ImgElementAttributes<Context>;
    height(value: string | Stateful<string, Context>): ImgElementAttributes<Context>;
    hspace(value: string | Stateful<string, Context>): ImgElementAttributes<Context>;
    ismap(value: boolean | Stateful<boolean, Context>): ImgElementAttributes<Context>;
    loading(value: string | Stateful<string, Context>): ImgElementAttributes<Context>;
    longdesc(value: string | Stateful<string, Context>): ImgElementAttributes<Context>;
    name(value: string | Stateful<string, Context>): ImgElementAttributes<Context>;
    referrerpolicy(value: string | Stateful<string, Context>): ImgElementAttributes<Context>;
    sizes(value: string | Stateful<string, Context>): ImgElementAttributes<Context>;
    src(value: string | Stateful<string, Context>): ImgElementAttributes<Context>;
    srcset(value: string | Stateful<string, Context>): ImgElementAttributes<Context>;
    usemap(value: string | Stateful<string, Context>): ImgElementAttributes<Context>;
    vspace(value: string | Stateful<string, Context>): ImgElementAttributes<Context>;
    width(value: string | Stateful<string, Context>): ImgElementAttributes<Context>;
}

export interface InputElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    accept(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
    align(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
    alt(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
    autocomplete(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
    checked(value: boolean | Stateful<boolean, Context>): InputElementAttributes<Context>;
    dirname(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
    disabled(value: boolean | Stateful<boolean, Context>): InputElementAttributes<Context>;
    form(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
    formaction(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
    formenctype(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
    formmethod(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
    formnovalidate(value: boolean | Stateful<boolean, Context>): InputElementAttributes<Context>;
    formtarget(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
    height(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
    ismap(value: boolean | Stateful<boolean, Context>): InputElementAttributes<Context>;
    list(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
    max(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
    maxlength(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
    min(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
    minlength(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
    multiple(value: boolean | Stateful<boolean, Context>): InputElementAttributes<Context>;
    name(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
    pattern(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
    placeholder(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
    popovertarget(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
    popovertargetaction(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
    readonly(value: boolean | Stateful<boolean, Context>): InputElementAttributes<Context>;
    required(value: boolean | Stateful<boolean, Context>): InputElementAttributes<Context>;
    size(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
    src(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
    step(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
    type(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
    usemap(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
    value(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
    width(value: string | Stateful<string, Context>): InputElementAttributes<Context>;
}

export interface InsElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    cite(value: string | Stateful<string, Context>): InsElementAttributes<Context>;
    datetime(value: string | Stateful<string, Context>): InsElementAttributes<Context>;
}

export interface KbdElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface LabelElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    for(value: string | Stateful<string, Context>): LabelElementAttributes<Context>;
    form(value: string | Stateful<string, Context>): LabelElementAttributes<Context>;
}

export interface LegendElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    align(value: string | Stateful<string, Context>): LegendElementAttributes<Context>;
}

export interface LiElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    type(value: string | Stateful<string, Context>): LiElementAttributes<Context>;
    value(value: string | Stateful<string, Context>): LiElementAttributes<Context>;
}

export interface LinkElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    as(value: string | Stateful<string, Context>): LinkElementAttributes<Context>;
    blocking(value: string | Stateful<string, Context>): LinkElementAttributes<Context>;
    charset(value: string | Stateful<string, Context>): LinkElementAttributes<Context>;
    color(value: string | Stateful<string, Context>): LinkElementAttributes<Context>;
    crossorigin(value: string | Stateful<string, Context>): LinkElementAttributes<Context>;
    disabled(value: boolean | Stateful<boolean, Context>): LinkElementAttributes<Context>;
    fetchpriority(value: string | Stateful<string, Context>): LinkElementAttributes<Context>;
    href(value: string | Stateful<string, Context>): LinkElementAttributes<Context>;
    hreflang(value: string | Stateful<string, Context>): LinkElementAttributes<Context>;
    imagesizes(value: string | Stateful<string, Context>): LinkElementAttributes<Context>;
    imagesrcset(value: string | Stateful<string, Context>): LinkElementAttributes<Context>;
    integrity(value: string | Stateful<string, Context>): LinkElementAttributes<Context>;
    media(value: string | Stateful<string, Context>): LinkElementAttributes<Context>;
    referrerpolicy(value: string | Stateful<string, Context>): LinkElementAttributes<Context>;
    rel(value: string | Stateful<string, Context>): LinkElementAttributes<Context>;
    rev(value: string | Stateful<string, Context>): LinkElementAttributes<Context>;
    sizes(value: string | Stateful<string, Context>): LinkElementAttributes<Context>;
    target(value: string | Stateful<string, Context>): LinkElementAttributes<Context>;
    type(value: string | Stateful<string, Context>): LinkElementAttributes<Context>;
}

export interface MainElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface MapElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    name(value: string | Stateful<string, Context>): MapElementAttributes<Context>;
}

export interface MarkElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface MathElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface MenuElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    compact(value: string | Stateful<string, Context>): MenuElementAttributes<Context>;
}

export interface MenuitemElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface MetaElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    charset(value: string | Stateful<string, Context>): MetaElementAttributes<Context>;
    content(value: string | Stateful<string, Context>): MetaElementAttributes<Context>;
    httpEquiv(value: string | Stateful<string, Context>): MetaElementAttributes<Context>;
    media(value: string | Stateful<string, Context>): MetaElementAttributes<Context>;
    name(value: string | Stateful<string, Context>): MetaElementAttributes<Context>;
    scheme(value: string | Stateful<string, Context>): MetaElementAttributes<Context>;
}

export interface MeterElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    high(value: string | Stateful<string, Context>): MeterElementAttributes<Context>;
    low(value: string | Stateful<string, Context>): MeterElementAttributes<Context>;
    max(value: string | Stateful<string, Context>): MeterElementAttributes<Context>;
    min(value: string | Stateful<string, Context>): MeterElementAttributes<Context>;
    optimum(value: string | Stateful<string, Context>): MeterElementAttributes<Context>;
    value(value: string | Stateful<string, Context>): MeterElementAttributes<Context>;
}

export interface NavElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface NoscriptElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface ObjectElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    align(value: string | Stateful<string, Context>): ObjectElementAttributes<Context>;
    archive(value: string | Stateful<string, Context>): ObjectElementAttributes<Context>;
    border(value: string | Stateful<string, Context>): ObjectElementAttributes<Context>;
    classid(value: string | Stateful<string, Context>): ObjectElementAttributes<Context>;
    codebase(value: string | Stateful<string, Context>): ObjectElementAttributes<Context>;
    codetype(value: string | Stateful<string, Context>): ObjectElementAttributes<Context>;
    data(value: string | Stateful<string, Context>): ObjectElementAttributes<Context>;
    declare(value: string | Stateful<string, Context>): ObjectElementAttributes<Context>;
    form(value: string | Stateful<string, Context>): ObjectElementAttributes<Context>;
    height(value: string | Stateful<string, Context>): ObjectElementAttributes<Context>;
    hspace(value: string | Stateful<string, Context>): ObjectElementAttributes<Context>;
    name(value: string | Stateful<string, Context>): ObjectElementAttributes<Context>;
    standby(value: string | Stateful<string, Context>): ObjectElementAttributes<Context>;
    type(value: string | Stateful<string, Context>): ObjectElementAttributes<Context>;
    typemustmatch(value: string | Stateful<string, Context>): ObjectElementAttributes<Context>;
    usemap(value: string | Stateful<string, Context>): ObjectElementAttributes<Context>;
    vspace(value: string | Stateful<string, Context>): ObjectElementAttributes<Context>;
    width(value: string | Stateful<string, Context>): ObjectElementAttributes<Context>;
}

export interface OlElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    compact(value: string | Stateful<string, Context>): OlElementAttributes<Context>;
    reversed(value: boolean | Stateful<boolean, Context>): OlElementAttributes<Context>;
    start(value: string | Stateful<string, Context>): OlElementAttributes<Context>;
    type(value: string | Stateful<string, Context>): OlElementAttributes<Context>;
}

export interface OptgroupElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    disabled(value: boolean | Stateful<boolean, Context>): OptgroupElementAttributes<Context>;
    label(value: string | Stateful<string, Context>): OptgroupElementAttributes<Context>;
}

export interface OptionElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    disabled(value: boolean | Stateful<boolean, Context>): OptionElementAttributes<Context>;
    label(value: string | Stateful<string, Context>): OptionElementAttributes<Context>;
    selected(value: boolean | Stateful<boolean, Context>): OptionElementAttributes<Context>;
    value(value: string | Stateful<string, Context>): OptionElementAttributes<Context>;
}

export interface OutputElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    for(value: string | Stateful<string, Context>): OutputElementAttributes<Context>;
    form(value: string | Stateful<string, Context>): OutputElementAttributes<Context>;
    name(value: string | Stateful<string, Context>): OutputElementAttributes<Context>;
}

export interface PElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    align(value: string | Stateful<string, Context>): PElementAttributes<Context>;
}

export interface ParamElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    name(value: string | Stateful<string, Context>): ParamElementAttributes<Context>;
    type(value: string | Stateful<string, Context>): ParamElementAttributes<Context>;
    value(value: string | Stateful<string, Context>): ParamElementAttributes<Context>;
    valuetype(value: string | Stateful<string, Context>): ParamElementAttributes<Context>;
}

export interface PictureElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface PreElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    width(value: string | Stateful<string, Context>): PreElementAttributes<Context>;
}

export interface ProgressElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    max(value: string | Stateful<string, Context>): ProgressElementAttributes<Context>;
    value(value: string | Stateful<string, Context>): ProgressElementAttributes<Context>;
}

export interface QElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    cite(value: string | Stateful<string, Context>): QElementAttributes<Context>;
}

export interface RbElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface RpElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface RtElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface RtcElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface RubyElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface SElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface SampElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface ScriptElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    async(value: boolean | Stateful<boolean, Context>): ScriptElementAttributes<Context>;
    blocking(value: string | Stateful<string, Context>): ScriptElementAttributes<Context>;
    charset(value: string | Stateful<string, Context>): ScriptElementAttributes<Context>;
    crossorigin(value: string | Stateful<string, Context>): ScriptElementAttributes<Context>;
    defer(value: boolean | Stateful<boolean, Context>): ScriptElementAttributes<Context>;
    fetchpriority(value: string | Stateful<string, Context>): ScriptElementAttributes<Context>;
    integrity(value: string | Stateful<string, Context>): ScriptElementAttributes<Context>;
    language(value: string | Stateful<string, Context>): ScriptElementAttributes<Context>;
    nomodule(value: boolean | Stateful<boolean, Context>): ScriptElementAttributes<Context>;
    referrerpolicy(value: string | Stateful<string, Context>): ScriptElementAttributes<Context>;
    src(value: string | Stateful<string, Context>): ScriptElementAttributes<Context>;
    type(value: string | Stateful<string, Context>): ScriptElementAttributes<Context>;
}

export interface SearchElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface SectionElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface SelectElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    autocomplete(value: string | Stateful<string, Context>): SelectElementAttributes<Context>;
    disabled(value: boolean | Stateful<boolean, Context>): SelectElementAttributes<Context>;
    form(value: string | Stateful<string, Context>): SelectElementAttributes<Context>;
    multiple(value: boolean | Stateful<boolean, Context>): SelectElementAttributes<Context>;
    name(value: string | Stateful<string, Context>): SelectElementAttributes<Context>;
    required(value: boolean | Stateful<boolean, Context>): SelectElementAttributes<Context>;
    size(value: string | Stateful<string, Context>): SelectElementAttributes<Context>;
}

export interface SlotElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    name(value: string | Stateful<string, Context>): SlotElementAttributes<Context>;
}

export interface SmallElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface SourceElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    height(value: string | Stateful<string, Context>): SourceElementAttributes<Context>;
    media(value: string | Stateful<string, Context>): SourceElementAttributes<Context>;
    sizes(value: string | Stateful<string, Context>): SourceElementAttributes<Context>;
    src(value: string | Stateful<string, Context>): SourceElementAttributes<Context>;
    srcset(value: string | Stateful<string, Context>): SourceElementAttributes<Context>;
    type(value: string | Stateful<string, Context>): SourceElementAttributes<Context>;
    width(value: string | Stateful<string, Context>): SourceElementAttributes<Context>;
}

export interface SpanElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface StrongElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface StyleElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    blocking(value: string | Stateful<string, Context>): StyleElementAttributes<Context>;
    media(value: string | Stateful<string, Context>): StyleElementAttributes<Context>;
    type(value: string | Stateful<string, Context>): StyleElementAttributes<Context>;
}

export interface SubElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface SummaryElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface SupElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface TableElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    align(value: string | Stateful<string, Context>): TableElementAttributes<Context>;
    bgcolor(value: string | Stateful<string, Context>): TableElementAttributes<Context>;
    border(value: string | Stateful<string, Context>): TableElementAttributes<Context>;
    cellpadding(value: string | Stateful<string, Context>): TableElementAttributes<Context>;
    cellspacing(value: string | Stateful<string, Context>): TableElementAttributes<Context>;
    frame(value: string | Stateful<string, Context>): TableElementAttributes<Context>;
    rules(value: string | Stateful<string, Context>): TableElementAttributes<Context>;
    summary(value: string | Stateful<string, Context>): TableElementAttributes<Context>;
    width(value: string | Stateful<string, Context>): TableElementAttributes<Context>;
}

export interface TbodyElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    align(value: string | Stateful<string, Context>): TbodyElementAttributes<Context>;
    char(value: string | Stateful<string, Context>): TbodyElementAttributes<Context>;
    charoff(value: string | Stateful<string, Context>): TbodyElementAttributes<Context>;
    valign(value: string | Stateful<string, Context>): TbodyElementAttributes<Context>;
}

export interface TdElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    abbr(value: string | Stateful<string, Context>): TdElementAttributes<Context>;
    align(value: string | Stateful<string, Context>): TdElementAttributes<Context>;
    axis(value: string | Stateful<string, Context>): TdElementAttributes<Context>;
    bgcolor(value: string | Stateful<string, Context>): TdElementAttributes<Context>;
    char(value: string | Stateful<string, Context>): TdElementAttributes<Context>;
    charoff(value: string | Stateful<string, Context>): TdElementAttributes<Context>;
    colspan(value: string | Stateful<string, Context>): TdElementAttributes<Context>;
    headers(value: string | Stateful<string, Context>): TdElementAttributes<Context>;
    height(value: string | Stateful<string, Context>): TdElementAttributes<Context>;
    nowrap(value: string | Stateful<string, Context>): TdElementAttributes<Context>;
    rowspan(value: string | Stateful<string, Context>): TdElementAttributes<Context>;
    scope(value: string | Stateful<string, Context>): TdElementAttributes<Context>;
    valign(value: string | Stateful<string, Context>): TdElementAttributes<Context>;
    width(value: string | Stateful<string, Context>): TdElementAttributes<Context>;
}

export interface TemplateElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface TextareaElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    autocomplete(value: string | Stateful<string, Context>): TextareaElementAttributes<Context>;
    cols(value: string | Stateful<string, Context>): TextareaElementAttributes<Context>;
    dirname(value: string | Stateful<string, Context>): TextareaElementAttributes<Context>;
    disabled(value: boolean | Stateful<boolean, Context>): TextareaElementAttributes<Context>;
    form(value: string | Stateful<string, Context>): TextareaElementAttributes<Context>;
    maxlength(value: string | Stateful<string, Context>): TextareaElementAttributes<Context>;
    minlength(value: string | Stateful<string, Context>): TextareaElementAttributes<Context>;
    name(value: string | Stateful<string, Context>): TextareaElementAttributes<Context>;
    placeholder(value: string | Stateful<string, Context>): TextareaElementAttributes<Context>;
    readonly(value: boolean | Stateful<boolean, Context>): TextareaElementAttributes<Context>;
    required(value: boolean | Stateful<boolean, Context>): TextareaElementAttributes<Context>;
    rows(value: string | Stateful<string, Context>): TextareaElementAttributes<Context>;
    wrap(value: string | Stateful<string, Context>): TextareaElementAttributes<Context>;
}

export interface TfootElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    align(value: string | Stateful<string, Context>): TfootElementAttributes<Context>;
    char(value: string | Stateful<string, Context>): TfootElementAttributes<Context>;
    charoff(value: string | Stateful<string, Context>): TfootElementAttributes<Context>;
    valign(value: string | Stateful<string, Context>): TfootElementAttributes<Context>;
}

export interface ThElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    abbr(value: string | Stateful<string, Context>): ThElementAttributes<Context>;
    align(value: string | Stateful<string, Context>): ThElementAttributes<Context>;
    axis(value: string | Stateful<string, Context>): ThElementAttributes<Context>;
    bgcolor(value: string | Stateful<string, Context>): ThElementAttributes<Context>;
    char(value: string | Stateful<string, Context>): ThElementAttributes<Context>;
    charoff(value: string | Stateful<string, Context>): ThElementAttributes<Context>;
    colspan(value: string | Stateful<string, Context>): ThElementAttributes<Context>;
    headers(value: string | Stateful<string, Context>): ThElementAttributes<Context>;
    height(value: string | Stateful<string, Context>): ThElementAttributes<Context>;
    nowrap(value: string | Stateful<string, Context>): ThElementAttributes<Context>;
    rowspan(value: string | Stateful<string, Context>): ThElementAttributes<Context>;
    scope(value: string | Stateful<string, Context>): ThElementAttributes<Context>;
    valign(value: string | Stateful<string, Context>): ThElementAttributes<Context>;
    width(value: string | Stateful<string, Context>): ThElementAttributes<Context>;
}

export interface TheadElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    align(value: string | Stateful<string, Context>): TheadElementAttributes<Context>;
    char(value: string | Stateful<string, Context>): TheadElementAttributes<Context>;
    charoff(value: string | Stateful<string, Context>): TheadElementAttributes<Context>;
    valign(value: string | Stateful<string, Context>): TheadElementAttributes<Context>;
}

export interface TimeElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    datetime(value: string | Stateful<string, Context>): TimeElementAttributes<Context>;
}

export interface TitleElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface TrElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    align(value: string | Stateful<string, Context>): TrElementAttributes<Context>;
    bgcolor(value: string | Stateful<string, Context>): TrElementAttributes<Context>;
    char(value: string | Stateful<string, Context>): TrElementAttributes<Context>;
    charoff(value: string | Stateful<string, Context>): TrElementAttributes<Context>;
    valign(value: string | Stateful<string, Context>): TrElementAttributes<Context>;
}

export interface TrackElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    default(value: boolean | Stateful<boolean, Context>): TrackElementAttributes<Context>;
    kind(value: string | Stateful<string, Context>): TrackElementAttributes<Context>;
    label(value: string | Stateful<string, Context>): TrackElementAttributes<Context>;
    src(value: string | Stateful<string, Context>): TrackElementAttributes<Context>;
    srclang(value: string | Stateful<string, Context>): TrackElementAttributes<Context>;
}

export interface UElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface UlElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    compact(value: string | Stateful<string, Context>): UlElementAttributes<Context>;
    type(value: string | Stateful<string, Context>): UlElementAttributes<Context>;
}

export interface VarElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export interface VideoElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
    autoplay(value: boolean | Stateful<boolean, Context>): VideoElementAttributes<Context>;
    controls(value: boolean | Stateful<boolean, Context>): VideoElementAttributes<Context>;
    crossorigin(value: string | Stateful<string, Context>): VideoElementAttributes<Context>;
    height(value: string | Stateful<string, Context>): VideoElementAttributes<Context>;
    loop(value: boolean | Stateful<boolean, Context>): VideoElementAttributes<Context>;
    muted(value: boolean | Stateful<boolean, Context>): VideoElementAttributes<Context>;
    playsinline(value: boolean | Stateful<boolean, Context>): VideoElementAttributes<Context>;
    poster(value: string | Stateful<string, Context>): VideoElementAttributes<Context>;
    preload(value: string | Stateful<string, Context>): VideoElementAttributes<Context>;
    src(value: string | Stateful<string, Context>): VideoElementAttributes<Context>;
    width(value: string | Stateful<string, Context>): VideoElementAttributes<Context>;
}

export interface WbrElementAttributes<Context> extends SpecialAttributes<Context>, GlobalHTMLAttributes<Context> {
}

export type AriaAttribute = "activedescendant" | "atomic" | "autocomplete" | "busy" | "checked" | "colcount" | "colindex" | "colspan" | "controls" | "current" | "describedby" | "details" | "disabled" | "dropeffect" | "errormessage" | "expanded" | "flowto" | "grabbed" | "haspopup" | "hidden" | "invalid" | "keyshortcuts" | "label" | "labelledby" | "level" | "live" | "modal" | "multiline" | "multiselectable" | "orientation" | "owns" | "placeholder" | "posinset" | "pressed" | "readonly" | "relevant" | "required" | "roledescription" | "rowcount" | "rowindex" | "rowspan" | "selected" | "setsize" | "sort" | "valuemax" | "valuemin" | "valuenow" | "valuetext" | "";

export const booleanAttributes: Set<string> = new Set();
booleanAttributes.add("allowfullscreen")
booleanAttributes.add("async")
booleanAttributes.add("autofocus")
booleanAttributes.add("autoplay")
booleanAttributes.add("checked")
booleanAttributes.add("controls")
booleanAttributes.add("default")
booleanAttributes.add("defer")
booleanAttributes.add("disabled")
booleanAttributes.add("formnovalidate")
booleanAttributes.add("inert")
booleanAttributes.add("ismap")
booleanAttributes.add("itemscope")
booleanAttributes.add("loop")
booleanAttributes.add("multiple")
booleanAttributes.add("muted")
booleanAttributes.add("nomodule")
booleanAttributes.add("novalidate")
booleanAttributes.add("open")
booleanAttributes.add("playsinline")
booleanAttributes.add("readonly")
booleanAttributes.add("required")
booleanAttributes.add("reversed")
booleanAttributes.add("selected")
